import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const page = Number(query.page ?? 1); const limit = Number(query.limit ?? 20);
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { tenantId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.employee.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const emp = await this.prisma.employee.findFirst({
      where: { id, tenantId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true, role: true } } },
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(tenantId: string, dto: { userId: string; designation?: string; department?: string; joiningDate?: string; salary?: number; targetLeads?: number; targetBookings?: number }) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeCode = `EMP-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.employee.create({
      data: {
        tenantId, userId: dto.userId, employeeCode,
        designation: dto.designation,
        department: dto.department,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
        salary: dto.salary,
        targetLeads: dto.targetLeads ?? 0,
        targetBookings: dto.targetBookings ?? 0,
      },
    });
  }

  async update(id: string, tenantId: string, dto: Partial<{ designation: string; department: string; salary: number; targetLeads: number; targetBookings: number }>) {
    await this.findOne(id, tenantId);
    return this.prisma.employee.update({ where: { id }, data: dto as never });
  }

  async getCommissions(tenantId: string) {
    return this.prisma.commission.findMany({
      where: { tenantId },
      include: {
        booking: { include: { customer: { select: { firstName: true, lastName: true } }, unit: { select: { unitNumber: true } } } },
        channelPartner: { select: { companyName: true, contactName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
