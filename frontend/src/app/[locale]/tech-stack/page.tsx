import { PageShell } from '@/components/layout/PageShell';
import { TechStackMatrix } from '@/components/tech-stack/TechStackMatrix';
import { fetchContentBundle } from '@/lib/api/client';
import type { AppLocale } from '@/i18n/routing';

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
    <PageShell locale={locale} settings={content.siteSettings}>
      <TechStackMatrix
        items={content.techStack}
        settings={content.siteSettings}
        locale={locale}
      />
    </PageShell>
  );
}
