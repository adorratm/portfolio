import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertTechStackDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  iconName?: string;

  @IsOptional()
  @IsString()
  imageKey?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  proficiencyLevel?: number;

  @IsOptional()
  @IsInt()
  yearsExperience?: number;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
