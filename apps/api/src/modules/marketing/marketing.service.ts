import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; status?: string; type?: string }) {
    const page = Number(query.page ?? 1); const limit = Number(query.limit ?? 20);
    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { _count: { select: { leads: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    const [totalCampaigns, activeCampaigns] = await Promise.all([
      this.prisma.campaign.count({ where: { tenantId } }),
      this.prisma.campaign.count({ where: { tenantId, status: 'RUNNING' } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) }, stats: { total: totalCampaigns, active: activeCampaigns } };
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.campaign.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { leads: true } } },
    });
  }

  async create(tenantId: string, createdById: string, dto: { name: string; type: string; description?: string; scheduledAt?: Date; status?: string }) {
    return this.prisma.campaign.create({
      data: {
        tenantId, createdById, name: dto.name,
        type: dto.type as never,
        description: dto.description,
        status: (dto.status ?? 'DRAFT') as never,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<{ name: string; status: string; description: string; scheduledAt: Date }>) {
    return this.prisma.campaign.update({ where: { id }, data: dto as never });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }

  async getStats(tenantId: string, campaignId: string) {
    const campaign = await this.findOne(campaignId, tenantId);
    const [totalLeads, convertedLeads] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, campaignId } }),
      this.prisma.lead.count({ where: { tenantId, campaignId, status: 'CONVERTED' } }),
    ]);
    return {
      campaign,
      totalLeads,
      convertedLeads,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) + '%' : '0%',
    };
  }
}
