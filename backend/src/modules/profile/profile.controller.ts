import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from '@modules/profile/profile.service';
import { UpsertProfileDto } from '@modules/profile/dto/upsert-profile.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /** Public — frontend ana sayfa */
  @Get(':locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.profileService.findByLocale(locale);
  }

  /** Admin — tüm diller */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.profileService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertProfileDto) {
    return this.profileService.upsert(dto);
  }

  @Delete(':locale')
  @UseGuards(JwtAuthGuard)
  remove(@Param('locale') locale: Locale) {
    return this.profileService.remove(locale);
  }
}
