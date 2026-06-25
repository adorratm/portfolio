import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { Locale } from '@common/types/locale';

class TerminalLineDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  link?: string;
}

export class UpsertProfileDto {
  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  badgeText!: string;

  @IsString()
  headlinePrefix!: string;

  @IsString()
  headlineHighlight!: string;

  @IsString()
  bio!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminalLineDto)
  terminalLines!: TerminalLineDto[];

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
