import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads, newLeadsToday, totalProperties, availableUnits,
      totalBookings, bookingsThisMonth, totalCustomers, hotLeads,
      overdueFollowUps, pendingPayments, revenueResult, revenueMonthResult,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: startOfDay } } }),
      this.prisma.property.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.unit.count({ where: { tenantId, status: 'AVAILABLE', deletedAt: null } }),
      this.prisma.booking.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.booking.count({ where: { tenantId, deletedAt: null, createdAt: { gte: startOfMonth } } }),
      this.prisma.customer.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.lead.count({ where: { tenantId, isHot: true, deletedAt: null } }),
      this.prisma.followUp.count({
        where: { tenantId, isDone: false, scheduledAt: { lt: now } },
      }),
      this.prisma.payment.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'VERIFIED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'VERIFIED', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalLeads,
      newLeadsToday,
      totalProperties,
      availableUnits,
      totalBookings,
      bookingsThisMonth,
      totalRevenue: revenueResult._sum.amount ?? 0,
      revenueThisMonth: revenueMonthResult._sum.amount ?? 0,
      totalCustomers,
      hotLeads,
      overdueFollowUps,
      pendingPayments,
    };
  }

  async getLeadFunnel(tenantId: string) {
    const stages = await this.prisma.lead.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { stage: true },
    });
    return stages.map((s) => ({ stage: s.stage, count: s._count.stage }));
  }

  async getRecentActivity(tenantId: string, limit = 10) {
    return this.prisma.activityTimeline.findMany({
      where: { tenantId },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUpcomingFollowUps(tenantId: string, userId?: string, limit = 5) {
    const now = new Date();
    const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return this.prisma.followUp.findMany({
      where: {
        tenantId,
        isDone: false,
        scheduledAt: { gte: now, lte: next48h },
        ...(userId ? { assignedToId: userId } : {}),
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  async getLeadsBySource(tenantId: string) {
    const result = await this.prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId, deletedAt: null },
      _count: { source: true },
    });
    return result.map((r) => ({ source: r.source, count: r._count.source }));
  }

  async getMonthlyRevenue(tenantId: string, months = 6) {
    const results: { month: string; revenue: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const agg = await this.prisma.payment.aggregate({
        where: { tenantId, status: 'VERIFIED', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });

      results.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: Number(agg._sum.amount ?? 0),
      });
    }
    return results;
  }

  async getTopAgents(tenantId: string, limit = 5) {
    const agents = await this.prisma.user.findMany({
      where: { tenantId, role: 'AGENT', isActive: true, deletedAt: null },
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        _count: { select: { assignedLeads: true } },
      },
      take: limit,
    });

    const agentsWithBookings = await Promise.all(
      agents.map(async (agent) => {
        const bookings = await this.prisma.booking.count({
          where: { tenantId, assignedToId: agent.id },
        });
        return { ...agent, bookings, leads: agent._count.assignedLeads };
      }),
    );

    return agentsWithBookings.sort((a, b) => b.bookings - a.bookings);
  }
}
