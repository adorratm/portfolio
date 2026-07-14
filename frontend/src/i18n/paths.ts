import { getPathname } from '@/i18n/navigation';
import type { AppLocale, AppPathname } from '@/i18n/routing';

type LocalizedHref =
  | AppPathname
  | { pathname: AppPathname; params?: Record<string, string> };

/** Yerelleştirilmiş path (locale prefix yok): /projeler, /projects/foo */
export function localizedPathname(
  locale: AppLocale,
  href: LocalizedHref,
): string {
  return getPathname({ locale, href: href as never });
}

/** Tam site-relative href: /tr/projeler */
export function localizedHref(
  locale: AppLocale,
  href:
    | AppPathname
    | { pathname: AppPathname; params?: Record<string, string> },
): string {
  return `/${locale}${localizedPathname(locale, href)}`;
}

/** Eski İngilizce TR segment → yeni TR segment (301 map). */
export const LEGACY_TR_SEGMENT_REDIRECTS: Record<string, string> = {
  about: 'hakkimda',
  experience: 'deneyim',
  education: 'egitim',
  'tech-stack': 'teknoloji-yigini',
  projects: 'projeler',
};
