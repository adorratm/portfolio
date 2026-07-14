import { getPathname } from '@/i18n/navigation';
import type { AppLocale, AppPathname } from '@/i18n/routing';

type LocalizedHref =
  | AppPathname
  | { pathname: AppPathname; params?: Record<string, string> };

/**
 * next-intl getPathname localePrefix: 'always' ile zaten /tr/... veya /en/... döner.
 * Bu yardımcı, öneki temizler: /projeler, /projects/foo
 */
export function localizedPathname(
  locale: AppLocale,
  href: LocalizedHref,
): string {
  const full = getPathname({ locale, href: href as never });
  const prefix = `/${locale}`;
  if (full === prefix) return '/';
  if (full.startsWith(`${prefix}/`)) return full.slice(prefix.length);
  return full;
}

/** Tam site-relative href: /tr/projeler */
export function localizedHref(
  locale: AppLocale,
  href:
    | AppPathname
    | { pathname: AppPathname; params?: Record<string, string> },
): string {
  return getPathname({ locale, href: href as never });
}

/** Eski İngilizce TR segment → yeni TR segment (301 map). */
export const LEGACY_TR_SEGMENT_REDIRECTS: Record<string, string> = {
  about: 'hakkimda',
  experience: 'deneyim',
  education: 'egitim',
  'tech-stack': 'teknoloji-yigini',
  projects: 'projeler',
};
