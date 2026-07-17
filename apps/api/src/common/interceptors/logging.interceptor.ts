import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request & { tenantId?: string; user?: { sub: string } }>();
    const response = ctx.getResponse<Response>();

    const { method, url } = request;
    const tenantId = request.tenantId ?? 'unknown';
    const userId = request.user?.sub ?? 'anonymous';
    const startTime = Date.now();

    this.logger.log(
      `→ [${method}] ${url} | tenant=${tenantId} | user=${userId}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - startTime;
          const statusCode = response.statusCode;
          this.logger.log(
            `← [${method}] ${url} | ${statusCode} | ${elapsed}ms | tenant=${tenantId} | user=${userId}`,
          );
        },
        error: (err: unknown) => {
          const elapsed = Date.now() - startTime;
          const status = err instanceof Error ? (err as { status?: number }).status ?? 500 : 500;
          this.logger.error(
            `← [${method}] ${url} | ${status} | ${elapsed}ms | tenant=${tenantId} | user=${userId}`,
          );
        },
      }),
    );
  }
}
