import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; status?: string; bookingId?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const now = new Date();
    const where: Record<string, unknown> = { tenantId };
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.status === 'PAID') where.isPaid = true;
    if (query.status === 'PENDING') where.isPaid = false;
    if (query.status === 'OVERDUE') { where.isPaid = false; where.dueDate = { lt: now }; }

    const [data, total] = await Promise.all([
      this.prisma.bookingInstallment.findMany({
        where,
        include: {
          booking: {
            include: {
              customer: { select: { firstName: true, lastName: true, phone: true } },
              unit: { select: { unitNumber: true, floor: true } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bookingInstallment.count({ where }),
    ]);

    const [overdueCount, pendingAmount] = await Promise.all([
      this.prisma.bookingInstallment.count({ where: { tenantId, isPaid: false, dueDate: { lt: now } } }),
      this.prisma.bookingInstallment.aggregate({ where: { tenantId, isPaid: false }, _sum: { amount: true } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: { overdue: overdueCount, pendingAmount: Number(pendingAmount._sum.amount ?? 0) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const inst = await this.prisma.bookingInstallment.findFirst({
      where: { id, tenantId },
      include: { booking: { include: { customer: true, unit: true } } },
    });
    if (!inst) throw new NotFoundException('Installment not found');
    return inst;
  }

  async create(tenantId: string, dto: {
    bookingId: string; milestone: string; description?: string;
    dueDate: Date; amount: number; sortOrder?: number;
  }) {
    return this.prisma.bookingInstallment.create({
      data: {
        tenantId,
        bookingId: dto.bookingId,
        milestone: dto.milestone,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        amount: dto.amount,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async markPaid(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.bookingInstallment.update({
      where: { id },
      data: { isPaid: true, paidAt: new Date() },
    });
  }

  async getOverdue(tenantId: string) {
    return this.prisma.bookingInstallment.findMany({
      where: { tenantId, isPaid: false, dueDate: { lt: new Date() } },
      include: { booking: { include: { customer: { select: { firstName: true, lastName: true, phone: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }
}
