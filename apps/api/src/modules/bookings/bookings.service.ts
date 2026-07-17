import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextBookingNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.booking.count({ where: { tenantId } });
    return `BK-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { bookingNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          unit: { select: { id: true, unitNumber: true, floor: true, builtUpArea: true, status: true } },
          
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        unit: { include: { property: { select: { name: true, city: true, state: true } } } },
        installments: { orderBy: { dueDate: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
        
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(tenantId: string, createdById: string, dto: {
    unitId: string; customerId: string; leadId?: string; assignedToId: string;
    bookingDate: Date; agreementValue: number; bookingAmount: number;
    stampDuty?: number; registrationFee?: number; otherCharges?: number; notes?: string;
  }) {
    const bookingNumber = await this.nextBookingNumber(tenantId);
    const totalAmount = (dto.agreementValue ?? 0) + (dto.stampDuty ?? 0) + (dto.registrationFee ?? 0) + (dto.otherCharges ?? 0);

    // Mark unit as BOOKED
    await this.prisma.unit.update({ where: { id: dto.unitId }, data: { status: 'BOOKED' } });

    return this.prisma.booking.create({
      data: {
        tenantId, bookingNumber,
        unitId: dto.unitId,
        customerId: dto.customerId,
        leadId: dto.leadId,
        assignedToId: dto.assignedToId ?? createdById,
        createdById,
        bookingDate: new Date(dto.bookingDate),
        agreementValue: dto.agreementValue,
        bookingAmount: dto.bookingAmount,
        stampDuty: dto.stampDuty,
        registrationFee: dto.registrationFee,
        otherCharges: dto.otherCharges,
        totalAmount,
        status: 'PENDING',
        notes: dto.notes,
      },
      include: {
        customer: { select: { firstName: true, lastName: true, phone: true } },
        unit: { select: { unitNumber: true, floor: true } },
      },
    });
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    await this.findOne(id, tenantId);
    return this.prisma.booking.update({ where: { id }, data: { status: status as never } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
