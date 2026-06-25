import { Injectable } from '@nestjs/common';
import { ProfileService } from '@modules/profile/profile.service';
import { ProjectsService } from '@modules/projects/projects.service';
import { TechStackService } from '@modules/tech-stack/tech-stack.service';
import { SiteSettingsService } from '@modules/site-settings/site-settings.service';
import { UiTranslationsService } from '@modules/ui-translations/ui-translations.service';
import type { Locale } from '@common/types/locale';

/**
 * Tek istekte locale'e göre tüm public içeriği toplar.
 * Frontend ve admin önizleme bu bundle'ı kullanır.
 */
@Injectable()
export class ContentService {
  constructor(
    private readonly profileService: ProfileService,
    private readonly projectsService: ProjectsService,
    private readonly techStackService: TechStackService,
    private readonly siteSettingsService: SiteSettingsService,
    private readonly uiTranslationsService: UiTranslationsService,
  ) {}

  async getPublicBundle(locale: Locale) {
    const [profile, siteSettings, projects, techStack, ui] =
      await Promise.all([
        this.profileService.findByLocale(locale),
        this.siteSettingsService.findByLocale(locale),
        this.projectsService.findFeatured(locale),
        this.techStackService.findPublished(locale),
        this.uiTranslationsService.findByLocale(locale),
      ]);

    return {
      locale,
      profile,
      siteSettings,
      projects,
      techStack,
      ui: {
        frontend: ui?.frontendLabels ?? {},
        admin: ui?.adminLabels ?? {},
      },
    };
  }

  /** Admin — her iki dilin tam içeriği (yayında olmayanlar dahil) */
  async getAdminBundles() {
    const locales: Locale[] = ['tr', 'en'];
    const bundles = await Promise.all(
      locales.map(async (locale) => {
        const [profile, siteSettings, projects, techStack, ui] =
          await Promise.all([
            this.profileService.findAll().then((rows) =>
              rows.find((r) => r.locale === locale) ?? null,
            ),
            this.siteSettingsService.findByLocale(locale),
            this.projectsService.findAll().then((rows) =>
              rows.filter((p) => p.locale === locale),
            ),
            this.techStackService.findAll().then((rows) =>
              rows.filter((t) => t.locale === locale),
            ),
            this.uiTranslationsService.findByLocale(locale),
          ]);

        return {
          locale,
          profile,
          siteSettings,
          projects,
          techStack,
          ui: {
            frontend: ui?.frontendLabels ?? {},
            admin: ui?.adminLabels ?? {},
          },
        };
      }),
    );

    return { locales: bundles };
  }
}
