import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: {
    page?: number; limit?: number;
    status?: string; assignedToId?: string; leadId?: string;
  }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const now = new Date();

    const where: Record<string, unknown> = { tenantId };
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.leadId) where.leadId = query.leadId;
    if (query.status === 'PENDING') where.isDone = false;
    if (query.status === 'COMPLETED') where.isDone = true;
    if (query.status === 'OVERDUE') { where.isDone = false; where.scheduledAt = { lt: now }; }

    const [data, total] = await Promise.all([
      this.prisma.followUp.findMany({
        where,
        include: {
          lead: { select: { id: true, firstName: true, lastName: true, phone: true, status: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const [pendingCount, overdueCount, todayCount] = await Promise.all([
      this.prisma.followUp.count({ where: { tenantId, isDone: false } }),
      this.prisma.followUp.count({ where: { tenantId, isDone: false, scheduledAt: { lt: now } } }),
      this.prisma.followUp.count({ where: { tenantId, isDone: false, scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: { pending: pendingCount, overdue: overdueCount, today: todayCount },
    };
  }

  async findOne(id: string, tenantId: string) {
    const followUp = await this.prisma.followUp.findFirst({
      where: { id, tenantId },
      include: { lead: true },
    });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return followUp;
  }

  async create(tenantId: string, createdById: string, dto: {
    leadId: string; assignedToId?: string;
    type: string; scheduledAt: Date; notes?: string;
  }) {
    return this.prisma.followUp.create({
      data: {
        tenantId,
        leadId: dto.leadId,
        assignedToId: dto.assignedToId ?? createdById,
        type: dto.type as never,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
      },
      include: { lead: { select: { firstName: true, lastName: true, phone: true } } },
    });
  }

  async markDone(id: string, tenantId: string, dto: { outcome?: string; nextFollowUp?: Date }) {
    await this.findOne(id, tenantId);
    return this.prisma.followUp.update({
      where: { id },
      data: {
        isDone: true, doneAt: new Date(),
        outcome: dto.outcome,
        nextFollowUp: dto.nextFollowUp ? new Date(dto.nextFollowUp) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.followUp.delete({ where: { id } });
  }
}
