import { Module } from '@nestjs/common';
import { ActivityTimelineController } from './activity-timeline.controller';
import { ActivityTimelineService } from './activity-timeline.service';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityTimelineController],
  providers: [ActivityTimelineService],
  exports: [ActivityTimelineService],
})
export class ActivityTimelineModule {}
