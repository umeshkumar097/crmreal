import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private dateRange(from?: string, to?: string) {
    const gte = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const lte = to ? new Date(to) : new Date();
    return { gte, lte };
  }

  async getSalesReport(tenantId: string, query: { from?: string; to?: string }) {
    const range = this.dateRange(query.from, query.to);
    const [bookings, totalRevenue, byStatus] = await Promise.all([
      this.prisma.booking.findMany({
        where: { tenantId, deletedAt: null, bookingDate: range },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          unit: { select: { unitNumber: true, floor: true } },
          
        },
        orderBy: { bookingDate: 'desc' },
      }),
      this.prisma.booking.aggregate({ where: { tenantId, deletedAt: null, bookingDate: range }, _sum: { totalAmount: true }, _count: true }),
      this.prisma.booking.groupBy({ by: ['status'], where: { tenantId, deletedAt: null }, _count: { status: true }, _sum: { totalAmount: true } }),
    ]);
    return { bookings, totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0), totalCount: totalRevenue._count, byStatus };
  }

  async getLeadReport(tenantId: string, query: { from?: string; to?: string }) {
    const range = this.dateRange(query.from, query.to);
    const [bySource, byStatus, byStage, total, converted] = await Promise.all([
      this.prisma.lead.groupBy({ by: ['source'], where: { tenantId, deletedAt: null, createdAt: range }, _count: { source: true } }),
      this.prisma.lead.groupBy({ by: ['status'], where: { tenantId, deletedAt: null, createdAt: range }, _count: { status: true } }),
      this.prisma.lead.groupBy({ by: ['stage'], where: { tenantId, deletedAt: null, createdAt: range }, _count: { stage: true } }),
      this.prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: range } }),
      this.prisma.lead.count({ where: { tenantId, deletedAt: null, status: 'CONVERTED', createdAt: range } }),
    ]);
    return { bySource, byStatus, byStage, total, converted, conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) + '%' : '0%' };
  }

  async getPaymentReport(tenantId: string, query: { from?: string; to?: string }) {
    const range = this.dateRange(query.from, query.to);
    const [payments, byMode, byStatus, collected, pending] = await Promise.all([
      this.prisma.payment.findMany({
        where: { tenantId, paidAt: range },
        include: { booking: { include: { customer: { select: { firstName: true, lastName: true } } } } },
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.payment.groupBy({ by: ['mode'], where: { tenantId, paidAt: range }, _count: true, _sum: { amount: true } }),
      this.prisma.payment.groupBy({ by: ['status'], where: { tenantId, paidAt: range }, _count: true, _sum: { amount: true } }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'VERIFIED', paidAt: range }, _sum: { amount: true }, _count: true }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'PENDING' }, _sum: { amount: true }, _count: true }),
    ]);
    return { payments, byMode, byStatus, collected: Number(collected._sum.amount ?? 0), collectedCount: collected._count, pendingAmount: Number(pending._sum.amount ?? 0), pendingCount: pending._count };
  }

  async getInventoryReport(tenantId: string) {
    const [byStatus, properties] = await Promise.all([
      this.prisma.unit.groupBy({ by: ['status'], where: { tenantId, deletedAt: null }, _count: { status: true } }),
      this.prisma.property.findMany({
        where: { tenantId, deletedAt: null },
        include: { _count: { select: { units: true } }, units: { where: { deletedAt: null }, select: { status: true } } },
      }),
    ]);
    return { byStatus, properties: properties.map(p => ({
      id: p.id, name: p.name, city: p.city,
      total: p._count.units,
      available: p.units.filter(u => u.status === 'AVAILABLE').length,
      booked: p.units.filter(u => u.status === 'BOOKED').length,
      sold: p.units.filter(u => u.status === 'SOLD').length,
    })) };
  }

  async getAgentReport(tenantId: string, query: { from?: string; to?: string }) {
    const range = this.dateRange(query.from, query.to);
    const agents = await this.prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, role: true },
    });
    const agentStats = await Promise.all(agents.map(async agent => {
      const [leads, bookings, revenue] = await Promise.all([
        this.prisma.lead.count({ where: { tenantId, assignedToId: agent.id, createdAt: range } }),
        this.prisma.booking.count({ where: { tenantId, assignedToId: agent.id, bookingDate: range } }),
        this.prisma.payment.aggregate({ where: { tenantId, booking: { assignedToId: agent.id }, status: 'VERIFIED', paidAt: range }, _sum: { amount: true } }),
      ]);
      return { ...agent, leads, bookings, revenue: Number(revenue._sum.amount ?? 0) };
    }));
    return agentStats.sort((a, b) => b.bookings - a.bookings);
  }
}
