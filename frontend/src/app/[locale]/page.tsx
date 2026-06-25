import Link from 'next/link';
import { SiteNav } from '@/components/layout/SiteNav';
import { HeroSection } from '@/components/home/HeroSection';
import { ProjectsGrid } from '@/components/home/ProjectsGrid';
import { fetchContentBundle } from '@/lib/api/client';
import { label } from '@/lib/api/types';
import type { AppLocale } from '@/i18n/routing';

/**
 * Ana sayfa — tüm TR/EN içerik backend content bundle'dan gelir.
 */
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
        <div className="synthwave-grid absolute inset-0 -z-10 opacity-30" />

        <div className="mx-auto max-w-360 px-4 py-12 md:px-8">
          {profile && (
            <HeroSection
              badgeText={profile.badgeText}
              headlinePrefix={profile.headlinePrefix}
              headlineHighlight={profile.headlineHighlight}
              bio={profile.bio}
              terminalLines={profile.terminalLines}
            />
          )}

          <ProjectsGrid
            projects={projects}
            title={projectsTitle}
            viewAllLabel={siteSettings?.projectsViewAllLabel ?? undefined}
            viewAllHref={`/${locale}/projects`}
          />

          {siteSettings && (
            <section className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="glass-card col-span-2 min-h-75 rounded-xl p-8">
                <h4 className="mb-2 text-2xl font-semibold">
                  {siteSettings.philosophyTitle}
                </h4>
                <p className="text-on-surface-variant">
                  {siteSettings.philosophyBody}
                </p>
                {siteSettings.philosophyPillars?.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-4">
                    {siteSettings.philosophyPillars.map((pillar) => (
                      <div
                        key={pillar.label}
                        className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-4"
                      >
                        <span className="font-mono text-sm">{pillar.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card flex flex-col items-center justify-center rounded-xl p-8 text-center">
                <div className="mb-2 text-4xl font-bold text-primary">
                  {siteSettings.statDeployments}
                </div>
                <div className="font-mono text-xs uppercase text-on-surface-variant">
                  {siteSettings.statDeploymentsLabel ?? 'Deployments'}
                </div>
                <div className="my-6 h-px w-full bg-outline-variant" />
                <div className="mb-2 text-4xl font-bold text-tertiary">
                  {siteSettings.statUptime}
                </div>
                <div className="font-mono text-xs uppercase text-on-surface-variant">
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
        <div className="fixed bottom-8 right-8 z-50">
          <Link
            href={siteSettings.contactFabUrl ?? '#'}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_20px_rgba(189,147,249,0.4)] transition-all hover:scale-110"
            title={siteSettings.contactFabLabel}
          >
            <span className="text-2xl">✉</span>
          </Link>
        </div>
      )}
    </>
  );
}
