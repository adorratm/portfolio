import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';
import { SiteSettingsService } from '@modules/site-settings/site-settings.service';
import { SiteSettingsController } from '@modules/site-settings/site-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettings])],
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
