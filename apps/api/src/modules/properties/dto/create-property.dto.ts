import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ enum: ['APARTMENT','VILLA','PLOT','COMMERCIAL','STUDIO','PENTHOUSE','OFFICE','WAREHOUSE'] })
  @IsEnum(['APARTMENT','VILLA','PLOT','COMMERCIAL','STUDIO','PENTHOUSE','OFFICE','WAREHOUSE']) type: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() builderId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reraNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) totalUnits?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() launchDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() completionDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() amenities?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() images?: string[];
}
