import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExperienceService } from '@modules/experience/experience.service';
import { UpsertExperienceDto } from '@modules/experience/dto/upsert-experience.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.experienceService.findPublished(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.experienceService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertExperienceDto) {
    return this.experienceService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.experienceService.remove(id);
  }
}
