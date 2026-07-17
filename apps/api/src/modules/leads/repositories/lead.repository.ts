import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { LeadFilterDto } from '../dto/lead-filter.dto';
import { CreateLeadDto } from '../dto/create-lead.dto';

@Injectable()
export class LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filter: LeadFilterDto) {
    const {
      search, status, stage, source, priority,
      assignedToId, channelPartnerId, isHot,
      dateFrom, dateTo, page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = filter;

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { leadNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (source) where.source = source;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (channelPartnerId) where.channelPartnerId = channelPartnerId;
    if (isHot !== undefined) where.isHot = isHot;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const validSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'score', 'nextFollowUpAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          channelPartner: { select: { id: true, companyName: true, contactName: true } },
        },
        orderBy: { [orderByField]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, phone: true } },
        channelPartner: { select: { id: true, companyName: true, contactName: true, phone: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { followUps: true, documents: true, whatsappMessages: true } },
      },
    });
  }

  async findByPhone(phone: string, tenantId: string) {
    return this.prisma.lead.findFirst({
      where: { phone, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, createdById: string, data: CreateLeadDto & { leadNumber: string }) {
    return this.prisma.lead.create({
      data: {
        tenantId,
        createdById,
        leadNumber: data.leadNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp ?? data.phone,
        source: (data.source as never) ?? 'OTHER',
        priority: data.priority ?? 'MEDIUM',
        stage: data.stage ?? 'INQUIRY',
        isHot: data.isHot ?? false,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        preferredBHK: data.preferredBHK ?? [],
        preferredArea: data.preferredArea ?? [],
        preferredCity: data.preferredCity ?? data.locationPreference,
        notes: data.notes,
        tags: data.tags ?? [],
        assignedToId: data.assignedToId,
        channelPartnerId: data.channelPartnerId,
        campaignId: data.campaignId,
      },
    });
  }

  async update(id: string, tenantId: string, data: Partial<Record<string, unknown>>) {
    return this.prisma.lead.update({
      where: { id },
      data: { ...data, tenantId },
    });
  }

  async softDelete(id: string, tenantId: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date(), tenantId },
    });
  }

  async countByStatus(tenantId: string) {
    return this.prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { status: true },
    });
  }

  async countByStage(tenantId: string) {
    return this.prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { stage: true },
    });
  }

  async generateLeadNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.lead.count({ where: { tenantId } });
    const padded = String(count + 1).padStart(5, '0');
    return `L-${year}-${padded}`;
  }
}
