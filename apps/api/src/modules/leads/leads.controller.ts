import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AssignLeadDto, ChangeStageDto, ConvertLeadDto, AddNoteDto } from './dto/lead-action.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Leads')
@ApiBearerAuth('access-token')
@Controller({ path: 'leads', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads with filters and pagination' })
  findAll(
    @CurrentUser() user: { tenantId: string },
    @Query() filter: LeadFilterDto,
  ) {
    return this.leadsService.findAll(user.tenantId, filter);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get lead summary stats (counts by status/stage)' })
  getSummary(@CurrentUser() user: { tenantId: string }) {
    return this.leadsService.getSummaryStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { tenantId: string },
  ) {
    return this.leadsService.findOne(id, user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(user.tenantId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead details' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, user.tenantId, user.userId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a lead' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { tenantId: string },
  ) {
    return this.leadsService.remove(id, user.tenantId);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign lead to a team member' })
  assignLead(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: AssignLeadDto,
  ) {
    return this.leadsService.assignLead(id, user.tenantId, user.userId, dto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Change lead pipeline stage' })
  changeStage(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: ChangeStageDto,
  ) {
    return this.leadsService.changeStage(id, user.tenantId, user.userId, dto);
  }

  @Post(':id/convert')
  @Roles('ADMIN', 'MANAGER', 'AGENT')
  @ApiOperation({ summary: 'Convert lead to customer' })
  convertToCustomer(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: ConvertLeadDto,
  ) {
    return this.leadsService.convertToCustomer(id, user.tenantId, user.userId, dto);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get activity timeline for a lead' })
  getActivities(
    @Param('id') id: string,
    @CurrentUser() user: { tenantId: string },
  ) {
    return this.leadsService.getActivities(id, user.tenantId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a lead' })
  addNote(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: AddNoteDto,
  ) {
    return this.leadsService.addNote(id, user.tenantId, user.userId, dto.note);
  }

  // ─── Excel / CSV Import ──────────────────────────────────────────────────
  @Post('import')
  @ApiOperation({ summary: 'Bulk import leads from Excel (.xlsx) or CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, description: 'Import completed. Returns inserted/skipped/error counts.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/csv',
          'text/plain',
        ];
        const byExt = /\.(xlsx|xls|csv)$/i.test(file.originalname);
        if (allowed.includes(file.mimetype) || byExt) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only .xlsx, .xls, or .csv files are allowed'), false);
        }
      },
    }),
  )
  async importLeads(
    @CurrentUser() user: { userId: string; tenantId: string },
    @UploadedFile() file: Express.Multer.File,
    @Body('mapping') mapping?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.leadsService.importLeads(
      user.tenantId,
      user.userId,
      file.buffer,
      file.mimetype,
      mapping,
    );
  }

  @Get('import/template')
  @ApiOperation({ summary: 'Download the standard CSV import template for leads' })
  downloadTemplate() {
    const headers = [
      'firstName', 'lastName', 'phone', 'email', 'whatsapp',
      'source', 'priority', 'stage', 'propertyType',
      'budgetMin', 'budgetMax', 'locationPreference', 'preferredCity', 'notes',
    ];
    const sampleRows = [
      ['Rahul', 'Sharma', '9876543210', 'rahul@gmail.com', '9876543210', 'PORTAL', 'HIGH', 'INQUIRY', 'APARTMENT', '5000000', '8000000', 'Bandra West', 'Mumbai', 'Interested in sea-facing 2BHK'],
      ['Priya', 'Mehta', '9765432109', 'priya@email.com', '9765432109', 'REFERRAL', 'MEDIUM', 'INQUIRY', 'VILLA', '10000000', '15000000', 'Whitefield', 'Bangalore', 'Looking for gated community villa'],
    ];
    const csv = [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    return { csv, filename: 'realflow_leads_import_template.csv' };
  }
}
