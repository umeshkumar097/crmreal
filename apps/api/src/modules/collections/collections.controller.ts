import { Controller, Get, Post, Put, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Collections') @ApiBearerAuth('access-token')
@Controller({ path: 'collections', version: '1' }) @UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}
  @Get() findAll(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get('overdue') getOverdue(@Req() req: any) { return this.service.getOverdue(req.user.tenantId); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user.tenantId); }
  @Post() create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, dto); }
  @Put(':id/paid') markPaid(@Param('id') id: string, @Req() req: any, @Body() dto: { paymentId?: string }) { return this.service.markPaid(id, req.user.tenantId); }
}
