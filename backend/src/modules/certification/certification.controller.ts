import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CertificationService } from '@modules/certification/certification.service';
import { UpsertCertificationDto } from '@modules/certification/dto/upsert-certification.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.certificationService.findPublished(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.certificationService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertCertificationDto) {
    return this.certificationService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.certificationService.remove(id);
  }
}
