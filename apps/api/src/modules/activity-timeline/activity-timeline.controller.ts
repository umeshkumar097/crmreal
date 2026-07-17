import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityTimelineService } from './activity-timeline.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('ActivityTimeline')
@ApiBearerAuth('access-token')
@Controller({ path: 'activity-timeline', version: '1' })
@UseGuards(JwtAuthGuard)
export class ActivityTimelineController {
  constructor(private readonly service: ActivityTimelineService) {}

  @Get()
  findAll() {
    return [];
  }
}
