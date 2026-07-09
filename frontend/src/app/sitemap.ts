import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const FETCH_TIMEOUT_MS = 5_000;

const STATIC_PAGES = ['', '/about', '/experience', '/education', '/tech-stack', '/projects'] as const;

/** Build sırasında API'ye bağlanmayı engeller — sitemap runtime'da üretilir. */
export const dynamic = 'force-dynamic';

export const revalidate = 3600;

interface ContentRef {
  id: string;
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

function buildStaticEntries(base: string, now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ['tr', 'en'] as const) {
    for (const page of STATIC_PAGES) {
      entries.push({
        url: `${base}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
  const entries = buildStaticEntries(base, now);

  for (const locale of ['tr', 'en'] as const) {
    const [projects, techStack] = await Promise.all([
      fetchJson<ContentRef[]>(`/projects/public/${locale}/all`),
      fetchJson<ContentRef[]>(`/tech-stack/public/${locale}`),
    ]);

    for (const project of projects ?? []) {
      entries.push({
        url: `${base}/${locale}/projects/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const item of techStack ?? []) {
      entries.push({
        url: `${base}/${locale}/tech-stack/${item.id}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
