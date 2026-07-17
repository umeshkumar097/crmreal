import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    let settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!settings) settings = await this.prisma.tenantSettings.create({ data: { tenantId } });
    return settings;
  }

  async updateSettings(tenantId: string, dto: Partial<{
    companyLogo: string; gstin: string; reraNumber: string;
    companyPhone: string; companyEmail: string; companyWebsite: string;
    whatsappEnabled: boolean; aiEnabled: boolean; currency: string;
    timezone: string; dateFormat: string; companyAddress: object;
  }>) {
    return this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
    });
  }

  async getCompanyProfile(tenantId: string) {
    const [tenant, settings] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.getSettings(tenantId),
    ]);
    return { ...tenant, settings };
  }

  async updateCompanyProfile(tenantId: string, dto: {
    name?: string; gstin?: string; reraNumber?: string;
    companyPhone?: string; companyEmail?: string; companyWebsite?: string;
    companyAddress?: object; companyLogo?: string;
  }) {
    const { name, ...settingsDto } = dto;
    const [tenant, settings] = await Promise.all([
      name ? this.prisma.tenant.update({ where: { id: tenantId }, data: { name } }) : this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      this.updateSettings(tenantId, settingsDto),
    ]);
    return { ...tenant, settings };
  }

  async getUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, avatar: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getFeatureFlags(tenantId: string) {
    return this.prisma.featureFlag.findMany({ where: { tenantId } });
  }

  async updateFeatureFlag(tenantId: string, key: string, isEnabled: boolean) {
    return this.prisma.featureFlag.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, isEnabled },
      update: { isEnabled },
    });
  }
}
