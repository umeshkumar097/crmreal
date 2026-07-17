import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller({ path: 'tasks', version: '1' })
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  findAll(
    @Req() req: { user: { tenantId: string } },
    @Query() query: { page?: number; limit?: number; status?: string; assignedToId?: string; priority?: string },
  ) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Req() req: { user: { tenantId: string; sub: string } },
    @Body() dto: {
      title: string; description?: string; assignedToId?: string;
      relatedType?: string; relatedId?: string; dueDate?: Date; priority?: string;
    },
  ) {
    return this.service.create(req.user.tenantId, req.user.sub, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: { user: { tenantId: string } },
    @Body() dto: { title?: string; description?: string; dueDate?: Date; priority?: string; isDone?: boolean },
  ) {
    return this.service.update(id, req.user.tenantId, dto);
  }

  @Put(':id/done')
  markDone(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.markDone(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.remove(id, req.user.tenantId);
  }
}
