import {
  IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsString, IsArray, IsUUID, IsBoolean, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum LeadSource {
  WEBSITE = 'WEBSITE', REFERRAL = 'REFERRAL', WALK_IN = 'WALK_IN',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA', IVR = 'IVR', WHATSAPP = 'WHATSAPP',
  CP = 'CP', CAMPAIGN = 'CAMPAIGN', PORTAL = 'PORTAL',
  PHONE = 'PHONE', EMAIL = 'EMAIL', NEWSPAPER = 'NEWSPAPER',
  HOARDINGS = 'HOARDINGS', CHANNEL_PARTNER = 'CHANNEL_PARTNER', OTHER = 'OTHER',
}

export enum Priority { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', URGENT = 'URGENT' }

export enum LeadStage {
  INQUIRY = 'INQUIRY',
  INTERESTED = 'INTERESTED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  SITE_VISITED = 'SITE_VISITED',
  NEGOTIATION = 'NEGOTIATION',
  BOOKING_DONE = 'BOOKING_DONE',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT', VILLA = 'VILLA', PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL', OFFICE = 'OFFICE', SHOP = 'SHOP', WAREHOUSE = 'WAREHOUSE',
}

export class CreateLeadDto {
  @ApiProperty() @IsString() @IsNotEmpty() firstName: string;
  @ApiProperty() @IsString() @IsNotEmpty() lastName: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() whatsapp?: string;

  @ApiPropertyOptional({ enum: LeadSource }) @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @ApiPropertyOptional({ enum: Priority }) @IsOptional() @IsEnum(Priority) priority?: Priority;
  @ApiPropertyOptional({ enum: LeadStage }) @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @ApiPropertyOptional({ enum: PropertyType }) @IsOptional() @IsEnum(PropertyType) propertyType?: PropertyType;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) budgetMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) @Min(0) budgetMax?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() locationPreference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() preferredCity?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() preferredBHK?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() preferredArea?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isHot?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() channelPartnerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() campaignId?: string;
}
