import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from '@modules/site-settings/site-settings.service';
import { UpsertSiteSettingsDto } from '@modules/site-settings/dto/upsert-site-settings.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.siteSettingsService.findByLocale(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.siteSettingsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertSiteSettingsDto) {
    return this.siteSettingsService.upsert(dto);
  }
}
