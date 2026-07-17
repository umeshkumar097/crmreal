import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ChannelPartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page ?? 1); const limit = Number(query.limit ?? 20);
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (query.search) where.OR = [
      { companyName: { contains: query.search, mode: 'insensitive' } },
      { contactName: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.channelPartner.findMany({
        where,
        include: { _count: { select: { leads: true, commissions: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.channelPartner.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const cp = await this.prisma.channelPartner.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        leads: { where: { deletedAt: null }, select: { id: true, firstName: true, lastName: true, status: true, createdAt: true }, take: 10, orderBy: { createdAt: 'desc' } },
        commissions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!cp) throw new NotFoundException('Channel Partner not found');
    return cp;
  }

  async create(tenantId: string, dto: { companyName: string; contactName: string; email?: string; phone: string; reraNumber?: string; commissionRate?: number; city?: string }) {
    return this.prisma.channelPartner.create({ data: { tenantId, companyName: dto.companyName, contactName: dto.contactName, email: dto.email ?? '', phone: dto.phone, reraNumber: dto.reraNumber, commissionRate: dto.commissionRate ?? 2, city: dto.city } });
  }

  async update(id: string, tenantId: string, dto: Partial<{ companyName: string; contactName: string; email: string; phone: string; commissionRate: number; isActive: boolean }>) {
    await this.findOne(id, tenantId);
    return this.prisma.channelPartner.update({ where: { id }, data: dto as never });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.channelPartner.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getCommissions(tenantId: string, cpId: string) {
    return this.prisma.commission.findMany({
      where: { tenantId, channelPartnerId: cpId },
      include: { booking: { include: { customer: { select: { firstName: true, lastName: true } }, unit: { select: { unitNumber: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
