import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AuditLogs')
@ApiBearerAuth('access-token')
@Controller({ path: 'audit-logs', version: '1' })
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  findAll() {
    return [];
  }
}
