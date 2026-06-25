import { Module } from '@nestjs/common';
import { ContentService } from '@modules/content/content.service';
import { ContentController } from '@modules/content/content.controller';
import { ProfileModule } from '@modules/profile/profile.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { TechStackModule } from '@modules/tech-stack/tech-stack.module';
import { SiteSettingsModule } from '@modules/site-settings/site-settings.module';
import { UiTranslationsModule } from '@modules/ui-translations/ui-translations.module';

@Module({
  imports: [
    ProfileModule,
    ProjectsModule,
    TechStackModule,
    SiteSettingsModule,
    UiTranslationsModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
