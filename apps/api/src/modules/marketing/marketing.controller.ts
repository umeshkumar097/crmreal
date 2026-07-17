import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Marketing') @ApiBearerAuth('access-token')
@Controller({ path: 'marketing', version: '1' }) @UseGuards(JwtAuthGuard)
export class MarketingController {
  constructor(private readonly service: MarketingService) {}
  @Get() findAll(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user.tenantId); }
  @Get(':id/stats') getStats(@Param('id') id: string, @Req() req: any) { return this.service.getStats(req.user.tenantId, id); }
  @Post() create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, req.user.sub, dto); }
  @Put(':id') update(@Param('id') id: string, @Req() req: any, @Body() dto: any) { return this.service.update(id, req.user.tenantId, dto); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user.tenantId); }
}
