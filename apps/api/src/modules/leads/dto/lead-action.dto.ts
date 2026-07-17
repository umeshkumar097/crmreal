import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignLeadDto {
  @ApiProperty() @IsUUID() @IsNotEmpty() assignedToId: string;
}

export class ChangeStageDto {
  @ApiProperty() @IsString() @IsNotEmpty() stage: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ConvertLeadDto {
  @ApiPropertyOptional() @IsOptional() @IsString() panNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() aadharNumber?: string;
  @ApiPropertyOptional() @IsOptional() address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export class AddNoteDto {
  @ApiProperty() @IsString() @IsNotEmpty() note: string;
}
