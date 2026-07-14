import type { ContentBundle } from '@/lib/api/types';
import { localizedHref } from '@/i18n/paths';
import type { AppLocale } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/seo';
import { contentPathId } from '@/lib/slug';

export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}/og-image.jpg`;
}

export function buildPersonJsonLd(
  locale: AppLocale,
  content: Pick<ContentBundle, 'profile' | 'siteSettings' | 'techStack'>,
): Record<string, unknown> {
  const { profile, siteSettings, techStack } = content;
  const base = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${base}/#person`,
    name: siteSettings?.brandName?.replace('@', '') ?? 'Emre Kılıç',
    url: `${base}/${locale}`,
    image: profile?.imageUrl ?? getDefaultOgImageUrl(),
    description: profile?.bio,
    jobTitle: profile?.headlineHighlight,
    worksFor: {
      '@type': 'Organization',
      name: siteSettings?.brandSubtitle ?? 'Independent',
    },
    sameAs: (siteSettings?.socialLinks ?? []).map((link) => link.url),
    knowsAbout: techStack.slice(0, 12).map((item) => item.name),
  };
}

export function buildWebSiteJsonLd(locale: AppLocale, siteTitle: string): Record<string, unknown> {
  const base = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    name: siteTitle,
    url: `${base}/${locale}`,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
    publisher: { '@id': `${base}/#person` },
  };
}

export function buildProfilePageJsonLd(locale: AppLocale): Record<string, unknown> {
  const base = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${base}/${locale}#profilepage`,
    url: `${base}/${locale}`,
    mainEntity: { '@id': `${base}/#person` },
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };
}

export function buildProjectJsonLd(
  locale: AppLocale,
  project: {
    id: string;
    slug?: string;
    title: string;
    description: string;
    category: string;
    technologies: string[];
    externalUrl?: string | null;
    imageUrl?: string | null;
  },
): Record<string, unknown> {
  const base = getSiteUrl();
  const id = contentPathId(project);
  const url = `${base}${localizedHref(locale, {
    pathname: '/projects/[id]',
    params: { id },
  })}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description,
    url,
    applicationCategory: project.category,
    operatingSystem: 'Web',
    image: project.imageUrl ?? getDefaultOgImageUrl(),
    author: { '@id': `${base}/#person` },
    keywords: project.technologies.join(', '),
    ...(project.externalUrl ? { sameAs: project.externalUrl } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  locale: AppLocale,
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  const base = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path
        ? `${base}/${locale}${item.path.startsWith('/') ? item.path : `/${item.path}`}`
        : `${base}/${locale}`,
    })),
  };
}
