import type { MetadataRoute } from 'next';
import { localizedHref } from '@/i18n/paths';
import type { AppLocale, AppPathname } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/seo';
import { contentPathId } from '@/lib/slug';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const FETCH_TIMEOUT_MS = 5_000;

const STATIC_HREFS: AppPathname[] = [
  '/',
  '/about',
  '/experience',
  '/education',
  '/tech-stack',
  '/projects',
];

/** Build sırasında API'ye bağlanmayı engeller — sitemap runtime'da üretilir. */
export const dynamic = 'force-dynamic';

export const revalidate = 3600;

interface ContentRef {
  id: string;
  slug?: string;
  updatedAt?: string;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ['tr', 'en'] as const) {
    for (const href of STATIC_HREFS) {
      const path = href === '/' ? `/${locale}` : localizedHref(locale, href);
      entries.push({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency: href === '/' ? 'weekly' : 'monthly',
        priority: href === '/' ? 1 : 0.8,
      });
    }
  }

  for (const locale of ['tr', 'en'] as AppLocale[]) {
    const [projects, techStack] = await Promise.all([
      fetchJson<ContentRef[]>(`/projects/public/${locale}/all`),
      fetchJson<ContentRef[]>(`/tech-stack/public/${locale}`),
    ]);

    for (const project of projects ?? []) {
      const id = contentPathId(project);
      entries.push({
        url: `${base}${localizedHref(locale, {
          pathname: '/projects/[id]',
          params: { id },
        })}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const item of techStack ?? []) {
      const id = contentPathId(item);
      entries.push({
        url: `${base}${localizedHref(locale, {
          pathname: '/tech-stack/[id]',
          params: { id },
        })}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
