import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum LeadStatus { NEW='NEW', CONTACTED='CONTACTED', QUALIFIED='QUALIFIED', HOT='HOT', CONVERTED='CONVERTED', LOST='LOST', JUNK='JUNK' }
export enum PipelineStage { INQUIRY='INQUIRY', INTERESTED='INTERESTED', SITE_VISIT_SCHEDULED='SITE_VISIT_SCHEDULED', SITE_VISITED='SITE_VISITED', NEGOTIATION='NEGOTIATION', BOOKING_DONE='BOOKING_DONE', CLOSED_LOST='CLOSED_LOST' }

export class LeadFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: LeadStatus }) @IsOptional() @IsEnum(LeadStatus) status?: string;
  @ApiPropertyOptional({ enum: PipelineStage }) @IsOptional() @IsEnum(PipelineStage) stage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() channelPartnerId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() isHot?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() dateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() dateTo?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) limit?: number = 20;
  @ApiPropertyOptional({ default: 'createdAt' }) @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() sortOrder?: 'asc' | 'desc' = 'desc';
}
