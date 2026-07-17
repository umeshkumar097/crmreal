import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search;

    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          bookings: { select: { id: true, bookingNumber: true, totalAmount: true, status: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        bookings: {
          include: { unit: { select: { unitNumber: true, floor: true } } },
        },
        documents: { orderBy: { createdAt: 'desc' as const } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, dto: {
    leadId: string; firstName: string; lastName: string;
    email?: string; phone: string; whatsapp?: string;
    panNumber?: string; aadharNumber?: string; address?: object;
  }) {
    return this.prisma.customer.create({
      data: { tenantId, ...dto },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<{
    firstName: string; lastName: string; email: string;
    phone: string; panNumber: string; aadharNumber: string; address: object;
  }>) {
    await this.findOne(id, tenantId);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
