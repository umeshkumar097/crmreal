import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokens(userId: string, email: string, tenantId: string, role: string) {
    const payload = { sub: userId, email, tenantId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, tenantId, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async refreshTokens(userId: string, refreshToken: string, tenantId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, tenantId, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    let validSession: typeof sessions[0] | null = null;
    for (const session of sessions) {
      const isValid = await argon2.verify(session.tokenHash, refreshToken);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) throw new UnauthorizedException('Invalid refresh token');

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: validSession.id },
      data: { revokedAt: new Date() },
    });

    // Get user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('User not active');

    return this.generateTokens(userId, user.email, tenantId, user.role);
  }

  async revokeToken(userId: string, refreshToken: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });

    for (const session of sessions) {
      const isValid = await argon2.verify(session.tokenHash, refreshToken);
      if (isValid) {
        await this.prisma.refreshToken.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
        return;
      }
    }
  }

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
