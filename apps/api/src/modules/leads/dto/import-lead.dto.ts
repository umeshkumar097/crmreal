import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LeadSource, Priority, LeadStage, PropertyType } from './create-lead.dto';

export class ImportLeadRowDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() phone: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() whatsapp?: string;

  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsEnum(LeadStage) stage?: LeadStage;
  @IsOptional() @IsEnum(PropertyType) propertyType?: PropertyType;

  @IsOptional() @IsNumber() @Type(() => Number) @Min(0) budgetMin?: number;
  @IsOptional() @IsNumber() @Type(() => Number) @Min(0) budgetMax?: number;

  @IsOptional() @IsString() locationPreference?: string;
  @IsOptional() @IsString() preferredCity?: string;
  @IsOptional() @IsString() notes?: string;
}

export interface ImportResult {
  total: number;
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string; data: Record<string, unknown> }>;
}
