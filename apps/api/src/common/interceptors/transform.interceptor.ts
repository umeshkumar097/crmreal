import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/api-response.type';

type MaybeWrapped<T> =
  | ApiResponse<T>
  | PaginatedResponse<T>
  | { data: T; meta: PaginationMeta }
  | T;

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | PaginatedResponse<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<MaybeWrapped<T>>,
  ): Observable<ApiResponse<T> | PaginatedResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (this.isPaginatedPayload(response)) {
          const paginatedPayload = response as { data: T; meta: PaginationMeta };
          return {
            success: true,
            data: paginatedPayload.data,
            message: 'Success',
            errors: [],
            meta: paginatedPayload.meta,
          } satisfies PaginatedResponse<T>;
        }

        if (this.isAlreadyWrapped(response)) {
          return response as ApiResponse<T>;
        }

        return {
          success: true,
          data: response as T,
          message: 'Success',
          errors: [],
        } satisfies ApiResponse<T>;
      }),
    );
  }

  private isPaginatedPayload(response: MaybeWrapped<T>): boolean {
    return (
      response !== null &&
      typeof response === 'object' &&
      'data' in (response as object) &&
      'meta' in (response as object) &&
      typeof (response as { meta?: unknown }).meta === 'object' &&
      (response as { meta?: { page?: unknown } }).meta !== null &&
      'page' in ((response as { meta?: { page?: unknown } }).meta ?? {})
    );
  }

  private isAlreadyWrapped(response: MaybeWrapped<T>): boolean {
    return (
      response !== null &&
      typeof response === 'object' &&
      'success' in (response as object) &&
      'data' in (response as object) &&
      'message' in (response as object)
    );
  }
}
