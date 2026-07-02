import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertCertificationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  name!: string;

  @IsString()
  issuer!: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  credentialUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
