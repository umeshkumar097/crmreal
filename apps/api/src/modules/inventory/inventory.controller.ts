import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Inventory') @ApiBearerAuth('access-token')
@Controller({ path: 'inventory', version: '1' }) @UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}
  @Get() findAll(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user.tenantId); }
  @Post() create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, dto); }
  @Put(':id') update(@Param('id') id: string, @Req() req: any, @Body() dto: any) { return this.service.update(id, req.user.tenantId, dto); }
  @Put(':id/status') updateStatus(@Param('id') id: string, @Req() req: any, @Body() dto: { status: string }) { return this.service.updateStatus(id, req.user.tenantId, dto.status); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user.tenantId); }
}
