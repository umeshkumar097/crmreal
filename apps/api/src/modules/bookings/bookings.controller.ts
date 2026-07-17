import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller({ path: 'bookings', version: '1' })
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Get()
  findAll(
    @Req() req: { user: { tenantId: string } },
    @Query() query: { page?: number; limit?: number; search?: string; status?: string },
  ) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Post()
  create(
    @Req() req: { user: { tenantId: string; sub: string } },
    @Body() dto: {
      unitId: string; customerId: string; leadId?: string; assignedToId: string;
      bookingDate: Date; agreementValue: number; bookingAmount: number;
      stampDuty?: number; registrationFee?: number; otherCharges?: number; notes?: string;
    },
  ) {
    return this.service.create(req.user.tenantId, req.user.sub, dto);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req: { user: { tenantId: string } },
    @Body() dto: { status: string },
  ) {
    return this.service.updateStatus(id, req.user.tenantId, dto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { tenantId: string } }) {
    return this.service.remove(id, req.user.tenantId);
  }
}
