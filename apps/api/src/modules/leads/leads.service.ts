import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LeadRepository } from './repositories/lead.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { AssignLeadDto, ChangeStageDto, ConvertLeadDto } from './dto/lead-action.dto';
import { ImportResult } from './dto/import-lead.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadRepo: LeadRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(tenantId: string, filter: LeadFilterDto) {
    return this.leadRepo.findAll(tenantId, filter);
  }

  async findOne(id: string, tenantId: string) {
    const lead = await this.leadRepo.findById(id, tenantId);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async create(tenantId: string, createdById: string, dto: CreateLeadDto) {
    // Validate assigned user belongs to tenant
    if (dto.assignedToId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.assignedToId, tenantId, isActive: true, deletedAt: null },
      });
      if (!user) throw new BadRequestException('Assigned user not found in this organization');
    }

    const leadNumber = await this.leadRepo.generateLeadNumber(tenantId);
    const lead = await this.leadRepo.create(tenantId, createdById, { ...dto, leadNumber });

    // Log activity
    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId: createdById,
        type: 'NOTE',
        title: 'Lead created',
        entityType: 'Lead',
        entityId: lead.id,
        metadata: { source: dto.source },
      },
    });

    // Notify assignee
    if (dto.assignedToId && dto.assignedToId !== createdById) {
      await this.prisma.notification.create({
        data: {
          tenantId,
          userId: dto.assignedToId,
          type: 'LEAD_ASSIGNED',
          title: 'New Lead Assigned',
          body: `Lead ${lead.firstName} ${lead.lastName} has been assigned to you`,
          link: `/crm/leads/${lead.id}`,
        },
      });
    }

    return lead;
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateLeadDto) {
    await this.findOne(id, tenantId);
    const lead = await this.leadRepo.update(id, tenantId, dto as unknown as Partial<Record<string, unknown>>);

    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'NOTE',
        title: 'Lead updated',
        entityType: 'Lead',
        entityId: id,
        metadata: { updatedFields: Object.keys(dto) },
      },
    });

    return lead;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.leadRepo.softDelete(id, tenantId);
  }

  async assignLead(id: string, tenantId: string, userId: string, dto: AssignLeadDto) {
    const lead = await this.findOne(id, tenantId);

    const newAssignee = await this.prisma.user.findFirst({
      where: { id: dto.assignedToId, tenantId, isActive: true, deletedAt: null },
    });
    if (!newAssignee) throw new BadRequestException('Assignee not found');

    await this.leadRepo.update(id, tenantId, { assignedToId: dto.assignedToId });

    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'NOTE',
        title: `Lead reassigned to ${newAssignee.firstName} ${newAssignee.lastName}`,
        entityType: 'Lead',
        entityId: id,
        metadata: { previousAssignee: lead.assignedToId, newAssignee: dto.assignedToId },
      },
    });

    // Notify new assignee
    if (dto.assignedToId !== userId) {
      await this.prisma.notification.create({
        data: {
          tenantId,
          userId: dto.assignedToId,
          type: 'LEAD_ASSIGNED',
          title: 'Lead Assigned to You',
          body: `Lead ${lead.firstName} ${lead.lastName} has been assigned to you`,
          link: `/crm/leads/${lead.id}`,
        },
      });
    }

    return { message: 'Lead assigned successfully' };
  }

  async changeStage(id: string, tenantId: string, userId: string, dto: ChangeStageDto) {
    const lead = await this.findOne(id, tenantId);

    await this.leadRepo.update(id, tenantId, { stage: dto.stage });

    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'STATUS_CHANGE',
        title: `Stage changed: ${lead.stage} → ${dto.stage}`,
        entityType: 'Lead',
        entityId: id,
        metadata: { oldStage: lead.stage, newStage: dto.stage, notes: dto.notes },
      },
    });

    return { message: 'Stage updated', stage: dto.stage };
  }

  async convertToCustomer(id: string, tenantId: string, userId: string, dto: ConvertLeadDto) {
    const lead = await this.findOne(id, tenantId);

    if (lead.status === 'CONVERTED') {
      throw new BadRequestException('Lead is already converted');
    }

    const customer = await this.prisma.$transaction(async (tx) => {
      // Update lead status
      await tx.lead.update({
        where: { id },
        data: { status: 'CONVERTED', convertedAt: new Date() },
      });

      // Create customer
      return tx.customer.create({
        data: {
          tenantId,
          leadId: id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
          panNumber: dto.panNumber,
          aadharNumber: dto.aadharNumber,
          address: dto.address ?? {},
        },
      });
    });

    await this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'STATUS_CHANGE',
        title: 'Lead converted to Customer',
        entityType: 'Lead',
        entityId: id,
        metadata: { customerId: customer.id },
      },
    });

    return { message: 'Lead converted to customer', customer };
  }

  async getActivities(leadId: string, tenantId: string) {
    await this.findOne(leadId, tenantId);
    return this.prisma.activityTimeline.findMany({
      where: { entityType: 'Lead', entityId: leadId, tenantId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addNote(leadId: string, tenantId: string, userId: string, note: string) {
    await this.findOne(leadId, tenantId);
    return this.prisma.activityTimeline.create({
      data: {
        tenantId,
        userId,
        type: 'NOTE',
        title: 'Note added',
        description: note,
        entityType: 'Lead',
        entityId: leadId,
      },
    });
  }

  async getSummaryStats(tenantId: string) {
    const [byStatus, byStage, total, hotLeads, todayCount] = await Promise.all([
      this.leadRepo.countByStatus(tenantId),
      this.leadRepo.countByStage(tenantId),
      this.prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.lead.count({ where: { tenantId, isHot: true, deletedAt: null } }),
      this.prisma.lead.count({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return { total, hotLeads, todayCount, byStatus, byStage };
  }

  // ─── Excel / CSV Bulk Import ──────────────────────────────────────────────
  async importLeads(
    tenantId: string,
    createdById: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<ImportResult> {
    // Parse the workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
    });

    if (!rows.length) {
      throw new BadRequestException('File is empty or has no data rows');
    }
    if (rows.length > 2000) {
      throw new BadRequestException('Maximum 2000 rows allowed per import');
    }

    const result: ImportResult = { total: rows.length, inserted: 0, skipped: 0, errors: [] };

    // Column alias map — tolerant of user-defined headers
    const alias: Record<string, string> = {
      'first name': 'firstName', 'firstname': 'firstName', 'name': 'firstName',
      'last name': 'lastName', 'lastname': 'lastName', 'surname': 'lastName',
      'mobile': 'phone', 'mobile no': 'phone', 'mobile number': 'phone',
      'phone no': 'phone', 'phone number': 'phone', 'contact': 'phone',
      'email id': 'email', 'email address': 'email', 'mail': 'email',
      'whatsapp no': 'whatsapp', 'whatsapp number': 'whatsapp',
      'lead source': 'source', 'source of lead': 'source',
      'priority level': 'priority',
      'pipeline stage': 'stage', 'lead stage': 'stage', 'status': 'stage',
      'property type': 'propertyType', 'property': 'propertyType',
      'budget min': 'budgetMin', 'min budget': 'budgetMin',
      'budget max': 'budgetMax', 'max budget': 'budgetMax',
      'location': 'locationPreference', 'preferred location': 'locationPreference',
      'city': 'preferredCity', 'preferred city': 'preferredCity',
      'remarks': 'notes', 'comment': 'notes', 'comments': 'notes',
    };

    const normalise = (row: Record<string, unknown>): Record<string, string> => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        const key = k.trim().toLowerCase();
        const mapped = alias[key] ?? key;
        out[mapped] = String(v ?? '').trim();
      }
      return out;
    };

    const validSources = ['WEBSITE','REFERRAL','WALK_IN','SOCIAL_MEDIA','IVR','WHATSAPP','CP','CAMPAIGN','PORTAL','PHONE','EMAIL','NEWSPAPER','HOARDINGS','CHANNEL_PARTNER','OTHER'];
    const validPriorities = ['LOW','MEDIUM','HIGH','URGENT'];
    const validStages = ['INQUIRY','INTERESTED','SITE_VISIT_SCHEDULED','SITE_VISITED','NEGOTIATION','BOOKING_DONE'];
    const validPropertyTypes = ['APARTMENT','VILLA','PLOT','COMMERCIAL','OFFICE','SHOP','WAREHOUSE'];

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // 1-indexed + header row
      const raw = normalise(rows[i] as Record<string, unknown>);

      // Required field validation
      if (!raw.firstName && !raw.name) {
        result.skipped++;
        result.errors.push({ row: rowNum, reason: 'Missing First Name', data: rows[i] as Record<string, unknown> });
        continue;
      }
      if (!raw.phone) {
        result.skipped++;
        result.errors.push({ row: rowNum, reason: 'Missing Phone', data: rows[i] as Record<string, unknown> });
        continue;
      }

      // Check duplicate phone in this tenant
      const exists = await this.prisma.lead.findFirst({
        where: { tenantId, phone: raw.phone, deletedAt: null },
        select: { id: true },
      });
      if (exists) {
        result.skipped++;
        result.errors.push({ row: rowNum, reason: `Duplicate phone ${raw.phone}`, data: rows[i] as Record<string, unknown> });
        continue;
      }

      try {
        const dto: CreateLeadDto = {
          firstName: raw.firstName || (raw.name?.split(' ')[0] ?? ''),
          lastName: raw.lastName || (raw.name?.split(' ').slice(1).join(' ') ?? ''),
          phone: raw.phone,
          email: raw.email || undefined,
          whatsapp: raw.whatsapp || raw.phone || undefined,
          source: (validSources.includes(raw.source?.toUpperCase()) ? raw.source.toUpperCase() : 'OTHER') as any,
          priority: (validPriorities.includes(raw.priority?.toUpperCase()) ? raw.priority.toUpperCase() : 'MEDIUM') as any,
          stage: (validStages.includes(raw.stage?.toUpperCase()) ? raw.stage.toUpperCase() : 'INQUIRY') as any,
          propertyType: validPropertyTypes.includes(raw.propertyType?.toUpperCase()) ? raw.propertyType.toUpperCase() as any : undefined,
          budgetMin: raw.budgetMin ? parseFloat(raw.budgetMin.replace(/[^0-9.]/g, '')) || undefined : undefined,
          budgetMax: raw.budgetMax ? parseFloat(raw.budgetMax.replace(/[^0-9.]/g, '')) || undefined : undefined,
          locationPreference: raw.locationPreference || undefined,
          preferredCity: raw.preferredCity || undefined,
          notes: raw.notes || `Imported from file`,
        };

        await this.create(tenantId, createdById, dto);
        result.inserted++;
      } catch (err: unknown) {
        result.skipped++;
        result.errors.push({
          row: rowNum,
          reason: (err as { message?: string })?.message ?? 'Unknown error',
          data: rows[i] as Record<string, unknown>,
        });
      }
    }

    return result;
  }
}
