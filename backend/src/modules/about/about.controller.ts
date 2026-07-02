import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AboutService } from '@modules/about/about.service';
import { UpsertAboutDto } from '@modules/about/dto/upsert-about.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  /** Public — frontend /about sayfası */
  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.aboutService.findByLocale(locale);
  }

  /** Admin — tüm diller */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.aboutService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertAboutDto) {
    return this.aboutService.upsert(dto);
  }

  @Delete(':locale')
  @UseGuards(JwtAuthGuard)
  remove(@Param('locale') locale: Locale) {
    return this.aboutService.remove(locale);
  }
}
