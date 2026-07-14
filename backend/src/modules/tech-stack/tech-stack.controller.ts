import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TechStackService } from '@modules/tech-stack/tech-stack.service';
import { UpsertTechStackDto } from '@modules/tech-stack/dto/upsert-tech-stack.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('tech-stack')
export class TechStackController {
  constructor(private readonly techStackService: TechStackService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.techStackService.findPublished(locale);
  }

  @Get('public/:locale/:idOrSlug')
  findOnePublic(
    @Param('locale') locale: Locale,
    @Param('idOrSlug') idOrSlug: string,
  ) {
    return this.techStackService.findPublicByIdOrSlug(locale, idOrSlug);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.techStackService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertTechStackDto) {
    return this.techStackService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.techStackService.remove(id);
  }
}
