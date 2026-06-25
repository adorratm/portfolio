import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UiTranslationsService } from '@modules/ui-translations/ui-translations.service';
import { UpsertUiTranslationDto } from '@modules/ui-translations/dto/upsert-ui-translation.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('ui-translations')
export class UiTranslationsController {
  constructor(private readonly uiTranslationsService: UiTranslationsService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.uiTranslationsService.findByLocale(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.uiTranslationsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertUiTranslationDto) {
    return this.uiTranslationsService.upsert(dto);
  }
}
