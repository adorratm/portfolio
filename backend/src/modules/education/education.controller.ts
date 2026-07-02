import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EducationService } from '@modules/education/education.service';
import { UpsertEducationDto } from '@modules/education/dto/upsert-education.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.educationService.findPublished(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.educationService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertEducationDto) {
    return this.educationService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.educationService.remove(id);
  }
}
