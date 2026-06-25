import { SiteNav } from '@/components/layout/SiteNav';
import { ContactFab } from '@/components/layout/ContactFab';
import { AmbientBackground } from '@/components/effects/AmbientBackground';
import { HeroSection } from '@/components/home/HeroSection';
import { ProjectsGrid } from '@/components/home/ProjectsGrid';
import { fetchContentBundle } from '@/lib/api/client';
import { label } from '@/lib/api/types';
import type { AppLocale } from '@/i18n/routing';

const pillarDot: Record<string, string> = {
  green: 'bg-dracula-green',
  cyan: 'bg-secondary',
  purple: 'bg-primary-container',
};

const pillarFloat = ['float-animation', 'float-delayed', 'float-slow'] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const content = await fetchContentBundle(locale).catch(() => null);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-on-surface-variant">
        {locale === 'tr' ? 'İçerik yüklenemedi.' : 'Failed to load content.'}
      </div>
    );
  }

  const { profile, siteSettings, projects, ui } = content;
  const projectsTitle =
    siteSettings?.projectsSectionTitle ??
    label(ui.frontend, 'projects.title', 'Projects');

  return (
    <>
      <SiteNav locale={locale} settings={siteSettings} />

      <main className="relative min-h-screen pt-20 lg:pl-64">
        <AmbientBackground showFloatingDecor />

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-12 md:px-8">
          {profile && (
            <HeroSection
              badgeText={profile.badgeText}
              headlinePrefix={profile.headlinePrefix}
              headlineHighlight={profile.headlineHighlight}
              bio={profile.bio}
              imageUrl={profile.imageUrl}
              terminalLines={profile.terminalLines}
            />
          )}

          <ProjectsGrid
            projects={projects}
            title={projectsTitle}
            locale={locale}
            viewAllLabel={siteSettings?.projectsViewAllLabel ?? undefined}
            viewAllHref={`/${locale}/projects`}
          />

          {siteSettings && (
            <section className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="glass-card scanline-container col-span-2 min-h-[300px] rounded-xl p-8">
                <h4 className="mb-2 text-2xl font-semibold">
                  {siteSettings.philosophyTitle}
                </h4>
                <p className="text-on-surface-variant">{siteSettings.philosophyBody}</p>
                {siteSettings.philosophyPillars?.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-4">
                    {siteSettings.philosophyPillars.map((pillar, i) => (
                      <div
                        key={pillar.label}
                        className={`flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-4 ${pillarFloat[i % pillarFloat.length]}`}
                      >
                        <div
                          className={`h-2 w-2 animate-pulse rounded-full ${pillarDot[pillar.color] ?? 'bg-dracula-green'}`}
                        />
                        <span className="font-mono text-sm">{pillar.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card float-animation flex flex-col items-center justify-center rounded-xl p-8 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">
                  {siteSettings.statDeployments}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
                  {siteSettings.statDeploymentsLabel ?? 'Deployments'}
                </div>
                <div className="my-6 h-px w-full bg-outline-variant" />
                <div className="mb-2 text-4xl font-bold text-tertiary">
                  {siteSettings.statUptime}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
                  {siteSettings.statUptimeLabel ?? 'Uptime'}
                </div>
              </div>
            </section>
          )}

          {siteSettings?.footerTagline && (
            <footer className="border-t border-outline-variant pt-12 pb-24 text-center">
              <p className="font-mono text-sm text-on-surface-variant">
                {siteSettings.footerTagline}
              </p>
            </footer>
          )}
        </div>
      </main>

      {siteSettings?.contactFabLabel && (
        <ContactFab
          label={siteSettings.contactFabLabel}
          href={siteSettings.contactFabUrl ?? '#'}
        />
      )}
    </>
  );
}
