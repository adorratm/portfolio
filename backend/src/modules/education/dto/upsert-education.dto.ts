import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertEducationDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsString()
  period!: string;

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
