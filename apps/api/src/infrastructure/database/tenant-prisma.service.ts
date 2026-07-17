import { Injectable, Inject, Scope, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from './prisma.service';

type TenantPrismaClient = PrismaService;

@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService {
  private readonly logger = new Logger(TenantPrismaService.name);
  private tenantClient: TenantPrismaClient | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request & { tenantId?: string },
  ) {}

  get client(): TenantPrismaClient {
    if (this.tenantClient) {
      return this.tenantClient;
    }

    const tenantId = this.request.tenantId;

    if (!tenantId) {
      this.logger.warn('TenantPrismaService: No tenantId found on request, returning base client');
      return this.prisma;
    }

    this.tenantClient = this.prisma.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async findFirst({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async findUnique({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async create({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            const data = (args['data'] as Record<string, unknown>) ?? {};
            args['data'] = { ...data, tenantId };
            return query(args);
          },
          async createMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            const data = args['data'];
            if (Array.isArray(data)) {
              args['data'] = data.map((item: Record<string, unknown>) => ({ ...item, tenantId }));
            }
            return query(args);
          },
          async update({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async updateMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async delete({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async deleteMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async count({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
          async aggregate({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args['where'] = { ...((args['where'] as Record<string, unknown>) ?? {}), tenantId };
            return query(args);
          },
        },
      },
    }) as unknown as TenantPrismaClient;

    return this.tenantClient;
  }
}
