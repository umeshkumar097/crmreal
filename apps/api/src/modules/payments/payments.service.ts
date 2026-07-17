import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; status?: string; mode?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = { tenantId };
    if (query.status) where.status = query.status;
    if (query.mode) where.mode = query.mode;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              customer: { select: { firstName: true, lastName: true, phone: true } },
              unit: { select: { unitNumber: true, floor: true } },
            },
          },
          verifiedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { paidAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    // Revenue stats
    const [totalCollected, thisMonth, pending] = await Promise.all([
      this.prisma.payment.aggregate({ where: { tenantId, status: 'VERIFIED' }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'VERIFIED', paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'PENDING' }, _sum: { amount: true } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        totalCollected: Number(totalCollected._sum.amount ?? 0),
        thisMonth: Number(thisMonth._sum.amount ?? 0),
        pending: Number(pending._sum.amount ?? 0),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        booking: {
          include: { customer: true, unit: true },
        },
        verifiedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(tenantId: string, createdById: string, dto: {
    bookingId: string; installmentId?: string;
    amount: number; mode: string; referenceNo?: string;
    chequeNo?: string; bankName?: string; paidAt: Date; notes?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        tenantId,
        bookingId: dto.bookingId,
        installmentId: dto.installmentId,
        amount: dto.amount,
        mode: dto.mode as never,
        referenceNo: dto.referenceNo,
        chequeNo: dto.chequeNo,
        bankName: dto.bankName,
        paidAt: new Date(dto.paidAt),
        status: 'PENDING',
        notes: dto.notes,
      },
      include: {
        booking: { include: { customer: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async verify(id: string, tenantId: string, verifiedById: string) {
    await this.findOne(id, tenantId);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'VERIFIED', verifiedById, verifiedAt: new Date() },
    });
  }

  async reject(id: string, tenantId: string, remarks: string) {
    await this.findOne(id, tenantId);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'REJECTED', rejectedReason: remarks },
    });
  }
}
