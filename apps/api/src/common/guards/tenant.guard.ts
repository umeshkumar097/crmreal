import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { tenantId?: string; user?: JwtPayload }>();

    const user = request.user;

    if (!user) {
      return true;
    }

    const requestTenantId = request.tenantId;

    if (!requestTenantId) {
      throw new UnauthorizedException(
        'Tenant context is missing. Provide X-Tenant-ID header or use a tenant subdomain.',
      );
    }

    if (user.tenantId !== requestTenantId) {
      throw new UnauthorizedException(
        `Tenant mismatch: token belongs to tenant '${user.tenantId}' but request targets tenant '${requestTenantId}'.`,
      );
    }

    return true;
  }
}
