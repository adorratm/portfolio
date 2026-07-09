import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LangAttribute } from '@/components/seo/LangAttribute';
import { fetchContentBundle } from '@/lib/api/client';
import { buildSiteMetadata } from '@/lib/seo';
import { routing, type AppLocale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) {
    return {};
  }

  const content = await fetchContentBundle(locale as AppLocale).catch(() => null);
  const siteTitle = content?.siteSettings?.siteTitle ?? 'Emre Kılıç | Portfolio';
  const description =
    content?.profile?.bio ??
    (locale === 'tr'
      ? 'Backend mimarı ve yazılım geliştirici portfolyo sitesi'
      : 'Backend architect and software developer portfolio');

  return buildSiteMetadata(locale as AppLocale, {
    siteTitle,
    description: description.slice(0, 160),
    imageUrl: content?.profile?.imageUrl,
  });
}

/**
 * Locale layout — çeviri sağlayıcısı ve sayfa sarmalayıcısı.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LangAttribute locale={locale as AppLocale} />
      {children}
    </NextIntlClientProvider>
  );
}
