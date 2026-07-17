import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Properties')
@ApiBearerAuth('access-token')
@Controller({ path: 'properties', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Query() filter: { search?: string; type?: string; status?: string; city?: string; page?: number; limit?: number },
  ) {
    return this.propertiesService.findAll(user.tenantId, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { tenantId: string }) {
    return this.propertiesService.findOne(id, user.tenantId);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create new property/project' })
  create(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(user.tenantId, user.userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update property' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { tenantId: string },
    @Body() dto: Partial<CreatePropertyDto>,
  ) {
    return this.propertiesService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property' })
  remove(@Param('id') id: string, @CurrentUser() user: { tenantId: string }) {
    return this.propertiesService.remove(id, user.tenantId);
  }

  @Get(':id/inventory-summary')
  @ApiOperation({ summary: 'Get unit inventory summary for a property' })
  getInventorySummary(@Param('id') id: string, @CurrentUser() user: { tenantId: string }) {
    return this.propertiesService.getInventorySummary(id, user.tenantId);
  }
}
