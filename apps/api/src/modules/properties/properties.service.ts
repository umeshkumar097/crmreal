import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filter: { search?: string; type?: string; status?: string; city?: string; page?: number; limit?: number }) {
    const { search, type, status, city, page = 1, limit = 20 } = filter;
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { city: { contains: search, mode: 'insensitive' } }];
    if (type) where.type = type;
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: {
          builder: { select: { id: true, name: true } },
          _count: { select: { units: true, unitTypes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, tenantId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        builder: true,
        unitTypes: true,
        _count: { select: { units: true } },
      },
    });
    if (!property) throw new NotFoundException(`Property ${id} not found`);
    return property;
  }

  async create(tenantId: string, createdById: string, dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: {
        tenantId,
        createdById,
        name: dto.name,
        type: dto.type as never,
        city: dto.city,
        state: dto.state,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        pincode: dto.pincode,
        builderId: dto.builderId,
        reraNumber: dto.reraNumber,
        totalUnits: dto.totalUnits ?? 0,
        launchDate: dto.launchDate ? new Date(dto.launchDate) : undefined,
        completionDate: dto.completionDate ? new Date(dto.completionDate) : undefined,
        description: dto.description,
        amenities: dto.amenities ?? [],
        images: dto.images ?? [],
      },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<CreatePropertyDto>) {
    await this.findOne(id, tenantId);
    return this.prisma.property.update({ where: { id }, data: dto as never });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getInventorySummary(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    const summary = await this.prisma.unit.groupBy({
      by: ['status'],
      where: { propertyId: id, tenantId, deletedAt: null },
      _count: { status: true },
    });

    const result: Record<string, number> = { AVAILABLE: 0, HOLD: 0, BOOKED: 0, SOLD: 0, BLOCKED: 0, CANCELLED: 0 };
    summary.forEach((s) => { result[s.status] = s._count.status; });
    result.total = Object.values(result).reduce((a, b) => a + b, 0);
    return result;
  }
}
