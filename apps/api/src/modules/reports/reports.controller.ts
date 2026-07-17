import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reports') @ApiBearerAuth('access-token')
@Controller({ path: 'reports', version: '1' }) @UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}
  @Get()
  getReportsList() {
    return [
      { id: 'rep-1', name: 'Q2 Sales Analytics', type: 'SALES', generatedAt: new Date(Date.now() - 3600000 * 24).toISOString(), status: 'READY', downloadUrl: '#' },
      { id: 'rep-2', name: 'June Lead Source Distribution', type: 'LEADS', generatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), status: 'READY', downloadUrl: '#' },
      { id: 'rep-3', name: 'Pending Payments Ledger', type: 'PAYMENTS', generatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(), status: 'READY', downloadUrl: '#' }
    ];
  }

  @Get('sales') sales(@Req() req: any, @Query() q: any) { return this.service.getSalesReport(req.user.tenantId, q); }
  @Get('leads') leads(@Req() req: any, @Query() q: any) { return this.service.getLeadReport(req.user.tenantId, q); }
  @Get('payments') payments(@Req() req: any, @Query() q: any) { return this.service.getPaymentReport(req.user.tenantId, q); }
  @Get('inventory') inventory(@Req() req: any) { return this.service.getInventoryReport(req.user.tenantId); }
  @Get('agents') agents(@Req() req: any, @Query() q: any) { return this.service.getAgentReport(req.user.tenantId, q); }
}
