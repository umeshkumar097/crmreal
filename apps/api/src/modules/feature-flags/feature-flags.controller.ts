import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('FeatureFlags')
@ApiBearerAuth('access-token')
@Controller({ path: 'feature-flags', version: '1' })
@UseGuards(JwtAuthGuard)
export class FeatureFlagsController {
  constructor(private readonly service: FeatureFlagsService) {}

  @Get()
  findAll() {
    return [];
  }
}
