import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@config/configuration';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { TechStackModule } from '@modules/tech-stack/tech-stack.module';
import { AboutModule } from '@modules/about/about.module';
import { ExperienceModule } from '@modules/experience/experience.module';
import { EducationModule } from '@modules/education/education.module';
import { CertificationModule } from '@modules/certification/certification.module';
import { SiteSettingsModule } from '@modules/site-settings/site-settings.module';
import { MediaModule } from '@modules/media/media.module';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { QueueModule } from '@modules/queue/queue.module';
import { HealthModule } from '@modules/health/health.module';
import { UiTranslationsModule } from '@modules/ui-translations/ui-translations.module';
import { ContentModule } from '@modules/content/content.module';

/**
 * Kök uygulama modülü.
 * Her CMS alanı kendi NestJS modülünde; admin panelinden yönetilir.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    QueueModule,
    AuthModule,
    ProfileModule,
    ProjectsModule,
    TechStackModule,
    AboutModule,
    ExperienceModule,
    EducationModule,
    CertificationModule,
    SiteSettingsModule,
    MediaModule,
    MetricsModule,
    HealthModule,
    UiTranslationsModule,
    ContentModule,
  ],
})
export class AppModule {}
