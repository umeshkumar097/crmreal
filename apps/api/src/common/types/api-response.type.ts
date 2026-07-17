import { UserRole } from '../enums/user-role.enum';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errors: string[];
  statusCode: number;
  timestamp: string;
  path: string;
}

export type SortOrder = 'asc' | 'desc';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildPaginatedResponse<T>(
  data: T,
  meta: PaginationMeta,
): { data: T; meta: PaginationMeta } {
  return { data, meta };
}

export interface UserContext {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}
