import { IsIn, IsObject, IsOptional } from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertUiTranslationDto {
  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsOptional()
  @IsObject()
  frontendLabels?: Record<string, string>;

  @IsOptional()
  @IsObject()
  adminLabels?: Record<string, string>;
}
