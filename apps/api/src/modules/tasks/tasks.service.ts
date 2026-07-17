import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: {
    page?: number; limit?: number;
    status?: string; assignedToId?: string; priority?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Record<string, unknown> = { tenantId };
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.priority) where.priority = query.priority;
    if (query.status === 'DONE') where.isDone = true;
    if (query.status === 'PENDING') where.isDone = false;

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    // Group by status for kanban
    const todo = data.filter(t => !t.isDone && (!t.dueDate || new Date(t.dueDate) >= new Date()));
    const inProgress = data.filter(t => !t.isDone && t.dueDate && new Date(t.dueDate) < new Date() && new Date(t.dueDate) >= new Date(Date.now() - 24*60*60*1000));
    const done = data.filter(t => t.isDone);

    return {
      data,
      kanban: { todo, inProgress, done },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: { select: { firstName: true, lastName: true, avatar: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(tenantId: string, createdById: string, dto: {
    title: string; description?: string; assignedToId?: string;
    relatedType?: string; relatedId?: string;
    dueDate?: Date; priority?: string;
  }) {
    return this.prisma.task.create({
      data: {
        tenantId,
        createdById,
        assignedToId: dto.assignedToId ?? createdById,
        title: dto.title,
        description: dto.description,
        relatedType: dto.relatedType,
        relatedId: dto.relatedId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: (dto.priority as never) ?? 'MEDIUM',
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async markDone(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.task.update({
      where: { id },
      data: { isDone: true, doneAt: new Date() },
    });
  }

  async update(id: string, tenantId: string, dto: {
    title?: string; description?: string;
    dueDate?: Date; priority?: string; isDone?: boolean;
  }) {
    await this.findOne(id, tenantId);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: dto.priority as never,
        doneAt: dto.isDone ? new Date() : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.task.delete({ where: { id } });
  }
}
