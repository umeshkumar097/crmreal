import {
  Controller, Get, Post, Put, Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  findAll(
    @Req() req: { user: { tenantId: string } },
    @Query() query: { page?: number; limit?: number; status?: string; mode?: string },
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
      bookingId: string; installmentId?: string;
      amount: number; mode: string; referenceNo?: string;
      chequeNo?: string; bankName?: string; paidAt: Date; notes?: string;
    },
  ) {
    return this.service.create(req.user.tenantId, req.user.sub, dto);
  }

  @Put(':id/verify')
  verify(
    @Param('id') id: string,
    @Req() req: { user: { tenantId: string; sub: string } },
  ) {
    return this.service.verify(id, req.user.tenantId, req.user.sub);
  }

  @Put(':id/reject')
  reject(
    @Param('id') id: string,
    @Req() req: { user: { tenantId: string } },
    @Body() dto: { remarks: string },
  ) {
    return this.service.reject(id, req.user.tenantId, dto.remarks);
  }
}
