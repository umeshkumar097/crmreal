import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  private readonly mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<
      Request & { tenantId?: string; user?: JwtPayload }
    >();

    if (!this.mutationMethods.has(request.method)) {
      return next.handle();
    }

    const auditAction = this.reflector.getAllAndOverride<string>(AUDIT_ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditAction) {
      return next.handle();
    }

    const user = request.user;
    const tenantId = request.tenantId;

    if (!user || !tenantId) {
      return next.handle();
    }

    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      request.socket.remoteAddress ??
      'unknown';
    const userAgent = request.headers['user-agent'] ?? 'unknown';

    return next.handle().pipe(
      tap({
        next: (responseData: unknown) => {
          const entityId = this.extractEntityId(responseData);
          const entityType = this.deriveEntityType(request.url);

          this.prisma.auditLog
            .create({
              data: {
                tenantId,
                userId: user.sub,
                action: auditAction,
                entityType,
                entityId,
                ipAddress,
                userAgent,
              },
            })
            .catch((err: Error) => {
              this.logger.error(`Failed to write audit log: ${err.message}`, err.stack);
            });
        },
      }),
    );
  }

  private extractEntityId(data: unknown): string {
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (typeof obj['id'] === 'string') return obj['id'];
      if (typeof obj['id'] === 'number') return String(obj['id']);
      if (obj['data'] && typeof obj['data'] === 'object') {
        const inner = obj['data'] as Record<string, unknown>;
        if (typeof inner['id'] === 'string') return inner['id'];
      }
    }
    return 'unknown';
  }

  private deriveEntityType(url: string): string {
    const segments = url.split('/').filter(Boolean);
    const apiIndex = segments.findIndex((s) => s === 'api');
    const baseIndex = apiIndex >= 0 ? apiIndex + 1 : 0;
    return segments[baseIndex] ?? 'unknown';
  }
}
