import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@/components/seo/Analytics';
import { fetchContentBundle } from '@/lib/api/client';
import { buildSiteMetadata, truncateMetaDescription } from '@/lib/seo';
import { routing, type AppLocale } from '@/i18n/routing';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
});

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
    description: truncateMetaDescription(description),
    imageUrl: content?.profile?.imageUrl,
  });
}

/**
 * Locale layout — html lang, fontlar, çeviri sağlayıcısı.
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
    <html lang={locale} className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
