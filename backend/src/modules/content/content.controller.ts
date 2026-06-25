import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ContentService } from '@modules/content/content.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /** Public — frontend ve admin önizleme */
  @Get('public/:locale')
  getPublic(@Param('locale') locale: Locale) {
    return this.contentService.getPublicBundle(locale);
  }

  /** Admin — TR + EN tüm içerik */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  getAdminAll() {
    return this.contentService.getAdminBundles();
  }
}
