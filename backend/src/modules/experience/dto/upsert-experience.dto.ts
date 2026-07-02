import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertExperienceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  company!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsString()
  employmentType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  period!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  highlights!: string[];

  @IsArray()
  @IsString({ each: true })
  technologies!: string[];

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
