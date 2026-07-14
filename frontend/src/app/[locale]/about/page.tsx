import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { CvHero } from '@/components/cv/CvHero';
import { fetchContentBundle } from '@/lib/api/client';
import { buildSiteMetadata } from '@/lib/seo';
import type { AppLocale } from '@/i18n/routing';

const accentDot = ['bg-dracula-green', 'bg-secondary', 'bg-primary-container', 'bg-tertiary'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await fetchContentBundle(locale).catch(() => null);
  const siteTitle = content?.siteSettings?.siteTitle ?? 'Emre Kılıç | Portfolio';
  const description =
    content?.about?.summary ??
    (locale === 'tr' ? 'Hakkımda, uzmanlık alanlarım ve özgeçmiş' : 'About me, expertise areas and resume');

  return buildSiteMetadata(locale, {
    siteTitle,
    description,
    href: '/about',
    pageKey: 'about',
    imageUrl: content?.about?.imageUrl ?? content?.profile?.imageUrl,
  });
}

/** Hakkımda / özgeçmiş özeti */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const content = await fetchContentBundle(locale).catch(() => null);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono">
        {locale === 'tr' ? 'Yüklenemedi.' : 'Failed to load.'}
      </div>
    );
  }

  const about = content.about;
  const badge = locale === 'tr' ? 'Profil' : 'Profile';
  const title = about?.headline ?? (locale === 'tr' ? 'Hakkımda' : 'About Me');
  const profileImage =
    about?.imageUrl ?? content.profile?.imageUrl ?? null;
  const profileImageAlt =
    content.profile?.headlineHighlight ?? title;

  if (!about) {
    return (
      <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
        <CvHero
          badge={badge}
          title={title}
          imageUrl={profileImage}
          imageAlt={profileImageAlt}
        />
        <p className="font-mono text-on-surface-variant">
          {locale === 'tr'
            ? 'Hakkımda içeriği henüz eklenmedi.'
            : 'About content has not been added yet.'}
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <CvHero
        badge={badge}
        title={title}
        description={about.subtitle ?? undefined}
        imageUrl={profileImage}
        imageAlt={profileImageAlt}
      />

      <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card scanline-container col-span-1 rounded-xl p-8 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-secondary">
            <span className="text-primary">$</span>
            {locale === 'tr' ? 'whoami' : 'whoami'}
          </h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">{about.summary}</p>

          {about.resumeUrl && (
            <a
              href={about.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-hover mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-mono text-sm font-bold text-on-primary transition-all active:scale-95"
            >
              <span>↓</span>
              {about.resumeLabel ??
                (locale === 'tr' ? 'Özgeçmişi İndir' : 'Download Resume')}
            </a>
          )}
        </div>

        {about.highlights.length > 0 && (
          <div className="glass-card float-animation flex flex-col justify-center gap-6 rounded-xl p-8">
            {about.highlights.map((h, i) => (
              <div key={`${h.label}-${i}`} className="text-center">
                <div
                  className={`mb-1 text-4xl font-bold ${
                    ['text-dracula-green', 'text-secondary', 'text-primary', 'text-tertiary'][
                      i % 4
                    ]
                  }`}
                >
                  {h.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {about.expertiseAreas.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">
            {locale === 'tr' ? 'Uzmanlık Alanları' : 'Areas of Expertise'}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {about.expertiseAreas.map((area, i) => (
              <div
                key={`${area.title}-${i}`}
                className="glow-hover group rounded-xl border border-outline-variant bg-surface-container p-6 transition-all hover:border-primary-container"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container-highest text-xl text-primary transition-transform group-hover:scale-110">
                    {area.icon || '◆'}
                  </span>
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {about.skillGroups.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">
            {locale === 'tr' ? 'Yetenekler' : 'Skills'}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {about.skillGroups.map((group, i) => (
              <div
                key={`${group.category}-${i}`}
                className="rounded-xl border border-outline-variant bg-surface-container-low p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-secondary">
                  <span className={`h-2 w-2 rounded-full ${accentDot[i % accentDot.length]}`} />
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="tech-badge rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 font-mono text-sm text-on-surface"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
