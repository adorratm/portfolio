import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { ProjectsGrid } from '@/components/home/ProjectsGrid';
import { fetchAllProjects, fetchContentBundle } from '@/lib/api/client';
import { buildSiteMetadata } from '@/lib/seo';
import type { AppLocale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await fetchContentBundle(locale).catch(() => null);
  const siteTitle = content?.siteSettings?.siteTitle ?? 'Emre Kılıç | Portfolio';
  const description =
    locale === 'tr'
      ? 'Geliştirdiğim yazılım projeleri ve canlı sistemler'
      : 'Software projects and live systems I have built';

  return buildSiteMetadata(locale, {
    siteTitle,
    description,
    href: '/projects',
    pageKey: 'projects',
  });
}

/** Tüm projeler listesi */
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const [content, projects] = await Promise.all([
    fetchContentBundle(locale).catch(() => null),
    fetchAllProjects(locale).catch(() => []),
  ]);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono">
        {locale === 'tr' ? 'Yüklenemedi.' : 'Failed to load.'}
      </div>
    );
  }

  const title =
    content.siteSettings?.projectsSectionTitle ??
    (locale === 'tr' ? 'Projeler' : 'Projects');

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <div className="scanline-container relative mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 shadow-lg">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <span className="pulse-effect relative z-10 mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-secondary">
          {locale === 'tr' ? 'Canlı Sistemler' : 'Live Systems'}
        </span>
        <h1 className="hero-glow relative z-10 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="relative z-10 mt-3 max-w-2xl text-on-surface-variant">
          {locale === 'tr'
            ? 'Dağıtılmış mikroservisler, altyapı projeleri ve üretim ortamındaki sistemler.'
            : 'Distributed microservices, infrastructure projects, and production systems.'}
        </p>
      </div>
      <ProjectsGrid projects={projects} title="" locale={locale} />
    </PageShell>
  );
}
