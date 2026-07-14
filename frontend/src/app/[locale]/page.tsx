import { SiteNav } from '@/components/layout/SiteNav';
import { ContactFab } from '@/components/layout/ContactFab';
import { SocialLinks } from '@/components/layout/SocialLinks';
import { AmbientBackground } from '@/components/effects/AmbientBackground';
import { HeroSection } from '@/components/home/HeroSection';
import { ProjectsGrid } from '@/components/home/ProjectsGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchContentBundle } from '@/lib/api/client';
import { label } from '@/lib/api/types';
import {
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/json-ld';
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

  const { profile, siteSettings, projects, ui, techStack } = content;
  const projectsTitle =
    siteSettings?.projectsSectionTitle ??
    label(ui.frontend, 'projects.title', 'Projects');
  const siteTitle = siteSettings?.siteTitle ?? 'Emre Kılıç | Portfolio';
  const homeProjects = projects.slice(0, 4).map((project) => ({
    ...project,
    description:
      project.description.length > 160
        ? `${project.description.slice(0, 157).trimEnd()}…`
        : project.description,
  }));

  return (
    <>
      <JsonLd
        data={[
          buildPersonJsonLd(locale, { profile, siteSettings, techStack }),
          buildWebSiteJsonLd(locale, siteTitle),
          buildProfilePageJsonLd(locale),
        ]}
      />

      <SiteNav locale={locale} settings={siteSettings} profile={profile} />

      <main className="relative min-h-screen pt-20 lg:pl-64">
        <AmbientBackground showFloatingDecor />

        <div className="relative z-10 mx-auto max-w-360 px-4 py-12 md:px-8">
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
            projects={homeProjects}
            title={projectsTitle}
            locale={locale}
            viewAllLabel={siteSettings?.projectsViewAllLabel ?? undefined}
            viewAllHref="/projects"
          />

          {siteSettings && (
            <section className="mb-24 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="glass-card scanline-container col-span-2 min-h-75 rounded-xl p-8">
                <h2 className="mb-2 text-2xl font-semibold">
                  {siteSettings.philosophyTitle}
                </h2>
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

          <section className="mb-24 max-w-3xl" aria-labelledby="expertise-heading">
            <h2 id="expertise-heading" className="mb-4 text-2xl font-semibold">
              {locale === 'tr' ? 'Uzmanlık ve yaklaşım' : 'Expertise and approach'}
            </h2>
            <div className="space-y-4 text-on-surface-variant">
              {locale === 'tr' ? (
                <>
                  <p>
                    Ölçeklenebilir API tasarımı, veri odaklı uygulamalar ve yapay zekâ
                    destekli sistemler üzerine çalışıyorum. NestJS ve Node.js ile temiz
                    domain katmanları, TypeORM/PostgreSQL ile güvenilir veri modelleri,
                    Redis, RabbitMQ ve BullMQ ile asenkron iş kuyrukları kuruyorum.
                  </p>
                  <p>
                    Üretim ortamlarında Docker tabanlı dağıtım, gözlemlenebilirlik ve
                    sürdürülebilir mimari önceliğim. Bu portfolyo; canlı sistemler,
                    deneyim geçmişi, eğitim ve teknoloji yığınını TR/EN olarak
                    sunar — işbirliği veya proje görüşmesi için iletişime geçebilirsiniz.
                  </p>
                  {techStack.length > 0 && (
                    <p>
                      Sık kullandığım teknolojiler:{' '}
                      {techStack
                        .slice(0, 14)
                        .map((t) => t.name)
                        .join(', ')}
                      {techStack.length > 14 ? ' ve diğerleri.' : '.'}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    I design scalable APIs, data-driven applications, and AI-assisted
                    systems. With NestJS and Node.js I keep domain layers clear; with
                    TypeORM and PostgreSQL I model reliable data; with Redis, RabbitMQ,
                    and BullMQ I orchestrate asynchronous job queues.
                  </p>
                  <p>
                    In production I prioritize Docker-based delivery, observability, and
                    maintainable architecture. This portfolio presents live systems,
                    experience, education, and tech stack in TR/EN — reach out for
                    collaboration or project discussions.
                  </p>
                  {techStack.length > 0 && (
                    <p>
                      Technologies I use most:{' '}
                      {techStack
                        .slice(0, 14)
                        .map((t) => t.name)
                        .join(', ')}
                      {techStack.length > 14 ? ', and more.' : '.'}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          {(siteSettings?.footerTagline || (siteSettings?.socialLinks?.length ?? 0) > 0) && (
            <footer className="border-t border-outline-variant pt-12 pb-24 text-center">
              {(siteSettings?.socialLinks?.length ?? 0) > 0 && (
                <SocialLinks
                  links={siteSettings?.socialLinks ?? []}
                  className="mb-6 justify-center"
                />
              )}
              {siteSettings?.footerTagline && (
                <p className="font-mono text-sm text-on-surface-variant">
                  {siteSettings.footerTagline}
                </p>
              )}
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
