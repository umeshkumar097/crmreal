import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);
  private readonly CRM_DOMAIN = process.env.CRM_DOMAIN ?? 'crm.app';

  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction): void {
    const tenantId = this.resolveTenantId(req);

    if (tenantId) {
      req.tenantId = tenantId;
      this.logger.debug(`Resolved tenant: '${tenantId}' for ${req.method} ${req.url}`);
    } else {
      this.logger.debug(`No tenant resolved for ${req.method} ${req.url}`);
    }

    next();
  }

  private resolveTenantId(req: Request): string | undefined {
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId && typeof headerTenantId === 'string' && headerTenantId.trim()) {
      return headerTenantId.trim().toLowerCase();
    }

    const host = req.headers['host'] ?? '';
    const subdomain = this.extractSubdomain(host);
    if (subdomain) {
      return subdomain;
    }

    return undefined;
  }

  private extractSubdomain(host: string): string | undefined {
    const hostWithoutPort = host.split(':')[0];

    if (!hostWithoutPort) return undefined;

    const crmDomain = this.CRM_DOMAIN;
    const crmDomainWithDot = `.${crmDomain}`;

    if (hostWithoutPort.endsWith(crmDomainWithDot)) {
      const subdomain = hostWithoutPort.slice(0, -crmDomainWithDot.length);
      if (subdomain && !['www', 'api', 'admin'].includes(subdomain)) {
        return subdomain.toLowerCase();
      }
    }

    const parts = hostWithoutPort.split('.');
    if (parts.length > 2) {
      const potentialSubdomain = parts[0];
      if (potentialSubdomain && !['www', 'api', 'admin'].includes(potentialSubdomain)) {
        return potentialSubdomain.toLowerCase();
      }
    }

    return undefined;
  }
}
