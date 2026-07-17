import { Controller, Get, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Settings') @ApiBearerAuth('access-token')
@Controller({ path: 'settings', version: '1' }) @UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  @Get() getSettings(@Req() req: any) { return this.service.getSettings(req.user.tenantId); }
  @Put() updateSettings(@Req() req: any, @Body() dto: any) { return this.service.updateSettings(req.user.tenantId, dto); }
  @Get('company') getCompany(@Req() req: any) { return this.service.getCompanyProfile(req.user.tenantId); }
  @Put('company') updateCompany(@Req() req: any, @Body() dto: any) { return this.service.updateCompanyProfile(req.user.tenantId, dto); }
  @Get('users') getUsers(@Req() req: any) { return this.service.getUsers(req.user.tenantId); }
  @Get('feature-flags') getFlags(@Req() req: any) { return this.service.getFeatureFlags(req.user.tenantId); }
  @Put('feature-flags/:key') updateFlag(@Param('key') key: string, @Req() req: any, @Body() dto: { isEnabled: boolean }) { return this.service.updateFeatureFlag(req.user.tenantId, key, dto.isEnabled); }
}
