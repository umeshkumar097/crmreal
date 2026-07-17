import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class BuildersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.builder.findMany({
        where,
        include: { _count: { select: { properties: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.builder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const builder = await this.prisma.builder.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { properties: { where: { deletedAt: null }, select: { id: true, name: true, city: true, totalUnits: true } } },
    });
    if (!builder) throw new NotFoundException('Builder not found');
    return builder;
  }

  async create(tenantId: string, dto: {
    name: string; email?: string; phone?: string;
    website?: string; reraNumber?: string; address?: string;
  }) {
    return this.prisma.builder.create({ data: { tenantId, name: dto.name, email: dto.email, phone: dto.phone, website: dto.website, reraNumber: dto.reraNumber, address: dto.address } });
  }

  async update(id: string, tenantId: string, dto: Partial<{
    name: string; email: string; phone: string;
    website: string; reraNumber: string; address: string; isActive: boolean;
  }>) {
    await this.findOne(id, tenantId);
    return this.prisma.builder.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.builder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
