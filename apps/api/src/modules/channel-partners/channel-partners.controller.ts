import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelPartnersService } from './channel-partners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('ChannelPartners') @ApiBearerAuth('access-token')
@Controller({ path: 'channel-partners', version: '1' }) @UseGuards(JwtAuthGuard)
export class ChannelPartnersController {
  constructor(private readonly service: ChannelPartnersService) {}
  @Get() findAll(@Req() req: any, @Query() q: any) { return this.service.findAll(req.user.tenantId, q); }
  @Get(':id') findOne(@Param('id') id: string, @Req() req: any) { return this.service.findOne(id, req.user.tenantId); }
  @Get(':id/commissions') getCommissions(@Param('id') id: string, @Req() req: any) { return this.service.getCommissions(req.user.tenantId, id); }
  @Post() create(@Req() req: any, @Body() dto: any) { return this.service.create(req.user.tenantId, dto); }
  @Put(':id') update(@Param('id') id: string, @Req() req: any, @Body() dto: any) { return this.service.update(id, req.user.tenantId, dto); }
  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) { return this.service.remove(id, req.user.tenantId); }
}
