import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller({ path: 'dashboard', version: '1' })
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard KPI stats' })
  getStats(@CurrentUser() user: { tenantId: string }) {
    return this.dashboardService.getStats(user.tenantId);
  }

  @Get('lead-funnel')
  @ApiOperation({ summary: 'Get lead pipeline funnel data' })
  getLeadFunnel(@CurrentUser() user: { tenantId: string }) {
    return this.dashboardService.getLeadFunnel(user.tenantId);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  getRecentActivity(
    @CurrentUser() user: { tenantId: string },
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getRecentActivity(user.tenantId, limit);
  }

  @Get('upcoming-follow-ups')
  @ApiOperation({ summary: 'Get upcoming follow-ups (next 48h)' })
  getUpcomingFollowUps(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.dashboardService.getUpcomingFollowUps(user.tenantId, user.userId);
  }

  @Get('leads-by-source')
  @ApiOperation({ summary: 'Get leads grouped by source' })
  getLeadsBySource(@CurrentUser() user: { tenantId: string }) {
    return this.dashboardService.getLeadsBySource(user.tenantId);
  }

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Get last 6 months revenue trend' })
  getMonthlyRevenue(
    @CurrentUser() user: { tenantId: string },
    @Query('months') months?: number,
  ) {
    return this.dashboardService.getMonthlyRevenue(user.tenantId, months);
  }

  @Get('top-agents')
  @ApiOperation({ summary: 'Get top performing agents' })
  getTopAgents(@CurrentUser() user: { tenantId: string }) {
    return this.dashboardService.getTopAgents(user.tenantId);
  }
}
