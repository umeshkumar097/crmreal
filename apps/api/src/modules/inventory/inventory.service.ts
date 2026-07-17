import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; propertyId?: string; status?: string; type?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [data, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: { property: { select: { id: true, name: true, city: true } } },
        orderBy: [{ propertyId: 'asc' }, { unitNumber: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.unit.count({ where }),
    ]);

    // Stats by status
    const statusCounts = await this.prisma.unit.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { status: true },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {} as Record<string, number>),
    };
  }

  async findOne(id: string, tenantId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        property: { select: { id: true, name: true, city: true, state: true } },
        booking: { include: { customer: { select: { firstName: true, lastName: true, phone: true } } } },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async create(tenantId: string, dto: {
    propertyId: string; unitNumber: string; unitTypeId?: string; floor?: number;
    builtUpArea?: number; carpetArea?: number; basePrice?: number; tower?: string; facing?: string;
  }) {
    return this.prisma.unit.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        unitNumber: dto.unitNumber,
        unitTypeId: dto.unitTypeId ?? 'default',
        floor: dto.floor ?? 0,
        tower: dto.tower,
        facing: dto.facing,
        builtUpArea: dto.builtUpArea ?? 0,
        carpetArea: dto.carpetArea ?? (dto.builtUpArea ? dto.builtUpArea * 0.85 : 0),
        basePrice: dto.basePrice ?? 0,
        currentPrice: dto.basePrice ?? 0,
        status: 'AVAILABLE',
      },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<{
    unitNumber: string; type: string; floor: number; area: number;
    basePrice: number; finalPrice: number; features: object;
  }>) {
    await this.findOne(id, tenantId);
    return this.prisma.unit.update({ where: { id }, data: dto as never });
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    await this.findOne(id, tenantId);
    return this.prisma.unit.update({ where: { id }, data: { status: status as never } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.unit.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
