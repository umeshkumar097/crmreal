import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@Controller({ path: 'customers', version: '1' })
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  findAll(@Req() req: { user: { tenantId: string } }, @Query() query: { page?: number; limit?: number; search?: string }) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: { user: { tenantId: string; sub: string } }, @Body() dto: {
    leadId: string; firstName: string; lastName: string;
    email?: string; phone: string; whatsapp?: string;
    panNumber?: string; aadharNumber?: string; address?: object;
  }) {
    return this.service.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req: { user: { tenantId: string } }, @Body() dto: {
    firstName?: string; lastName?: string; email?: string;
    phone?: string; panNumber?: string; aadharNumber?: string; address?: object;
  }) {
    return this.service.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.remove(id, req.user.tenantId);
  }
}
