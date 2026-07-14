import type { Metadata } from 'next';
import { localizedHref, localizedPathname } from '@/i18n/paths';
import type { AppLocale, AppPathname } from '@/i18n/routing';

export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}/og-image.jpg`;
}

export function resolveOgImageUrl(imageUrl?: string | null): string {
  return imageUrl ?? getDefaultOgImageUrl();
}

const DEFAULT_SITE_URL = 'https://emrekilic.web.tr';

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');
}

/** Pixel tabanlı SEO araçları için ~150 karakter (160 çoğu zaman sınırı aşar). */
export function truncateMetaDescription(text: string, maxChars = 150): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  const cut = normalized.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

const PAGE_TITLES: Record<string, Record<AppLocale, string>> = {
  home: { tr: 'Ana Sayfa', en: 'Home' },
  about: { tr: 'Hakkımda', en: 'About' },
  experience: { tr: 'Deneyim', en: 'Experience' },
  education: { tr: 'Eğitim', en: 'Education' },
  'tech-stack': { tr: 'Teknoloji Yığını', en: 'Tech Stack' },
  projects: { tr: 'Projeler', en: 'Projects' },
};

export type SeoHref =
  | AppPathname
  | { pathname: AppPathname; params?: Record<string, string> }
  | '';

export function buildPageTitle(
  siteTitle: string,
  pageKey?: keyof typeof PAGE_TITLES,
  locale?: AppLocale,
): string {
  if (pageKey && locale) {
    return `${PAGE_TITLES[pageKey][locale]} | ${siteTitle}`;
  }
  return siteTitle;
}

function absoluteLocalizedUrl(locale: AppLocale, href: SeoHref = ''): string {
  const base = getSiteUrl();
  if (!href || href === '/') {
    return `${base}/${locale}`;
  }
  return `${base}${localizedHref(locale, href)}`;
}

/** Yerelleştirilmiş path (locale prefix'siz) — OG/breadcrumb için. */
export function seoPath(
  locale: AppLocale,
  href: SeoHref = '',
): string {
  if (!href || href === '/') return '';
  return localizedPathname(locale, href);
}

export function buildAlternates(
  locale: AppLocale,
  href: SeoHref = '',
): NonNullable<Metadata['alternates']> {
  return {
    canonical: absoluteLocalizedUrl(locale, href),
    languages: {
      tr: absoluteLocalizedUrl('tr', href),
      en: absoluteLocalizedUrl('en', href),
      'x-default': absoluteLocalizedUrl('tr', href),
    },
  };
}

export function buildOpenGraph(
  locale: AppLocale,
  title: string,
  description: string,
  href: SeoHref = '',
  imageUrl?: string | null,
): NonNullable<Metadata['openGraph']> {
  const url = absoluteLocalizedUrl(locale, href);

  return {
    type: 'website',
    locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    alternateLocale: locale === 'tr' ? ['en_US'] : ['tr_TR'],
    url,
    siteName: title.split(' | ').pop() ?? title,
    title,
    description,
    ...(imageUrl || getDefaultOgImageUrl()
      ? {
          images: [
            {
              url: resolveOgImageUrl(imageUrl),
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }
      : {}),
  };
}

export function buildTwitterCard(
  title: string,
  description: string,
  imageUrl?: string | null,
): NonNullable<Metadata['twitter']> {
  const image = resolveOgImageUrl(imageUrl);
  return {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
  };
}

export function buildSiteMetadata(
  locale: AppLocale,
  options: {
    siteTitle: string;
    description: string;
    href?: SeoHref;
    /** @deprecated Use href instead */
    path?: string;
    pageKey?: keyof typeof PAGE_TITLES;
    imageUrl?: string | null;
  },
): Metadata {
  const title = buildPageTitle(options.siteTitle, options.pageKey, locale);
  const ogImage = resolveOgImageUrl(options.imageUrl);
  const description = truncateMetaDescription(options.description);
  const href =
    options.href ??
    (options.path
      ? (options.path as AppPathname)
      : ('' as const));

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: buildAlternates(locale, href === '' ? '' : href),
    openGraph: buildOpenGraph(locale, title, description, href === '' ? '' : href, ogImage),
    twitter: buildTwitterCard(title, description, ogImage),
    robots: { index: true, follow: true },
  };
}
