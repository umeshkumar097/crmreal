import { Controller, Get, Post, Put, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('HR') @ApiBearerAuth('access-token')
@Controller({ path: 'hr', version: '1' }) @UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly service: HrService) {}
  @Get() findAll(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get('employees') findAllEmployees(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get('commissions') getCommissions(@Req() req: any, @Query('employeeId') eid?: string) { return this.service.getCommissions(req.user.tenantId); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user.tenantId); }
  @Get(':id/commissions') empCommissions(@Param('id') id: string, @Req() req: any) { return this.service.getCommissions(req.user.tenantId); }
  @Post() create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, dto); }
  @Put(':id') update(@Param('id') id: string, @Req() req: any, @Body() dto: any) { return this.service.update(id, req.user.tenantId, dto); }
}
