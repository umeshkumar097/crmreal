import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; leadId?: string; bookingId?: string; customerId?: string; type?: string }) {
    const page = Number(query.page ?? 1); const limit = Number(query.limit ?? 20);
    const where: Record<string, unknown> = { tenantId };
    if (query.leadId) where.leadId = query.leadId;
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.type) where.type = query.type;

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getByEntity(tenantId: string, entityType: string, entityId: string) {
    const where: Record<string, unknown> = { tenantId };
    if (entityType === 'lead') where.leadId = entityId;
    else if (entityType === 'booking') where.bookingId = entityId;
    else if (entityType === 'customer') where.customerId = entityId;
    return this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, uploadedById: string, dto: {
    name: string; type: string; url: string; storageKey?: string;
    mimeType?: string; sizeBytes?: number;
    leadId?: string; bookingId?: string; customerId?: string;
  }) {
    return this.prisma.document.create({
      data: {
        tenantId, uploadedById,
        name: dto.name, type: dto.type, url: dto.url,
        storageKey: dto.storageKey ?? dto.url,
        mimeType: dto.mimeType ?? 'application/octet-stream',
        sizeBytes: dto.sizeBytes ?? 0,
        leadId: dto.leadId, bookingId: dto.bookingId, customerId: dto.customerId,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.document.delete({ where: { id } });
  }
}
