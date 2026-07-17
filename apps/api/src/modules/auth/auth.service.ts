import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already registered
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (existingUser) throw new ConflictException('Email already registered');

    // Slugify company name
    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug } });
    const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug;

    const passwordHash = await argon2.hash(dto.password);

    // Create tenant + admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          slug: finalSlug,
          plan: dto.plan ?? 'STARTER',
        },
      });

      await tx.tenantSettings.create({
        data: { tenantId: tenant.id },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'ADMIN',
          emailVerified: false,
        },
      });

      // Default feature flags
      await tx.featureFlag.createMany({
        data: [
          { tenantId: tenant.id, key: 'whatsapp_integration', isEnabled: true, description: 'WhatsApp integration' },
          { tenantId: tenant.id, key: 'ai_copilot', isEnabled: false, description: 'AI Copilot' },
          { tenantId: tenant.id, key: 'customer_portal', isEnabled: true, description: 'Customer self-service portal' },
          { tenantId: tenant.id, key: 'advanced_reports', isEnabled: false, description: 'Advanced analytics' },
        ],
      });

      return { tenant, user };
    });

    const tokens = await this.tokenService.generateTokens(
      result.user.id,
      result.user.email,
      result.tenant.id,
      result.user.role,
    );

    return {
      user: this.sanitizeUser(result.user),
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
      ...tokens,
    };
  }

  async login(dto: LoginDto, tenantId?: string) {
    // Find user by email — if tenantId provided, scope to that tenant
    // otherwise find any active user with this email (multi-tenant login by email)
    const user = await this.prisma.user.findFirst({
      where: tenantId
        ? { email: dto.email, tenantId, deletedAt: null }
        : { email: dto.email, deletedAt: null },
      include: { tenant: { select: { id: true, name: true, slug: true, isActive: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');
    if (user.tenant && !user.tenant.isActive) throw new UnauthorizedException('Tenant is deactivated');

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.tenantId,
      user.role,
    );

    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant,
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string, tenantId: string) {
    return this.tokenService.refreshTokens(userId, refreshToken, tenantId);
  }

  async logout(userId: string, refreshToken: string) {
    await this.tokenService.revokeToken(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      include: {
        tenant: { select: { id: true, name: true, slug: true, plan: true } },
        employee: { select: { employeeCode: true, department: true, designation: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user as { passwordHash: string; [key: string]: unknown };
    return sanitized;
  }
}
