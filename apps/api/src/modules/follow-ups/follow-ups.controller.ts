import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowUpsService } from './follow-ups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('FollowUps')
@ApiBearerAuth('access-token')
@Controller({ path: 'follow-ups', version: '1' })
@UseGuards(JwtAuthGuard)
export class FollowUpsController {
  constructor(private readonly service: FollowUpsService) {}

  @Get()
  findAll(
    @Req() req: { user: { tenantId: string } },
    @Query() query: { page?: number; limit?: number; status?: string; assignedToId?: string; leadId?: string },
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
      leadId: string; assignedToId?: string;
      type: string; scheduledAt: Date; notes?: string;
    },
  ) {
    return this.service.create(req.user.tenantId, req.user.sub, dto);
  }

  @Put(':id/done')
  markDone(
    @Param('id') id: string,
    @Req() req: { user: { tenantId: string } },
    @Body() dto: { outcome?: string; nextFollowUp?: Date },
  ) {
    return this.service.markDone(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.remove(id, req.user.tenantId);
  }
}
