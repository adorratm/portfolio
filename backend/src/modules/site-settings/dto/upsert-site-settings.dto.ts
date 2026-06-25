import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import type { Locale } from '@common/types/locale';

export class UpsertSiteSettingsDto {
  @IsIn(['tr', 'en'])
  locale!: Locale;

  @IsString()
  siteTitle!: string;

  @IsString()
  brandName!: string;

  @IsString()
  brandSubtitle!: string;

  @IsArray()
  navItems!: Array<{ label: string; href: string; icon?: string }>;

  @IsOptional()
  @IsString()
  philosophyTitle?: string;

  @IsOptional()
  @IsString()
  philosophyBody?: string;

  @IsOptional()
  @IsArray()
  philosophyPillars?: Array<{ label: string; color: string }>;

  @IsOptional()
  @IsString()
  statDeployments?: string;

  @IsOptional()
  @IsString()
  statUptime?: string;

  @IsOptional()
  @IsString()
  statDeploymentsLabel?: string;

  @IsOptional()
  @IsString()
  statUptimeLabel?: string;

  @IsOptional()
  @IsString()
  projectsSectionTitle?: string;

  @IsOptional()
  @IsString()
  projectsViewAllLabel?: string;

  @IsOptional()
  @IsString()
  footerTagline?: string;

  @IsOptional()
  @IsArray()
  socialLinks?: Array<{ type: string; url: string; icon: string }>;

  @IsOptional()
  @IsString()
  contactFabLabel?: string;

  @IsOptional()
  @IsString()
  contactFabUrl?: string;
}
