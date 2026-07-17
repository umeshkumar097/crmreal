import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tenants')
@ApiBearerAuth('access-token')
@Controller({ path: 'tenants', version: '1' })
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  findAll() {
    return [];
  }
}
