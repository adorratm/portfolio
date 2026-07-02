import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Locale } from '@common/types/locale';

class ExpertiseAreaDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

class SkillGroupDto {
  @IsString()
  category!: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}

class AboutHighlightDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;
}

export class UpsertAboutDto {
  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  headline!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  summary!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpertiseAreaDto)
  expertiseAreas!: ExpertiseAreaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillGroupDto)
  skillGroups!: SkillGroupDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutHighlightDto)
  highlights!: AboutHighlightDto[];

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  resumeLabel?: string;

  @IsOptional()
  @IsString()
  imageKey?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
