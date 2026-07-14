import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { TechStackMatrix } from '@/components/tech-stack/TechStackMatrix';
import { fetchContentBundle } from '@/lib/api/client';
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

  return buildSiteMetadata(locale, {
    siteTitle,
    description:
      locale === 'tr'
        ? 'Kullandığım diller, çerçeveler, araçlar ve altyapı teknolojileri.'
        : 'Languages, frameworks, tools, and infrastructure I work with.',
    href: '/tech-stack',
    pageKey: 'tech-stack',
    imageUrl: content?.profile?.imageUrl,
  });
}

/** Teknoloji yığını sayfası — design bento matris düzeni */
export default async function TechStackPage({
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

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <TechStackMatrix
        items={content.techStack}
        settings={content.siteSettings}
        locale={locale}
      />
    </PageShell>
  );
}
