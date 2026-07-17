import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    userId: string,
    type: string,
    title: string,
    body: string,
    link?: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: {
        tenantId, userId,
        type: type as never,
        title, body,
        link: link ?? null,
        metadata: (metadata ?? {}) as object,
      },
    });
  }

  async findAll(tenantId: string, userId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId, userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { tenantId, userId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markRead(id: string, userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId, tenantId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string, tenantId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, tenantId, isRead: false },
    });
    return { count };
  }
}
