import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const STATIC_PAGES = ['', '/about', '/experience', '/education', '/tech-stack', '/projects'] as const;

interface ProjectRef {
  id: string;
  updatedAt?: string;
}

async function fetchProjects(locale: 'tr' | 'en'): Promise<ProjectRef[]> {
  try {
    const response = await fetch(`${API_BASE}/projects/public/${locale}/all`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    return (await response.json()) as ProjectRef[];
  } catch {
    return [];
  }
}

async function fetchTechStack(locale: 'tr' | 'en'): Promise<ProjectRef[]> {
  try {
    const response = await fetch(`${API_BASE}/tech-stack/public/${locale}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    return (await response.json()) as ProjectRef[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();
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

    const [projects, techStack] = await Promise.all([
      fetchProjects(locale),
      fetchTechStack(locale),
    ]);

    for (const project of projects) {
      entries.push({
        url: `${base}/${locale}/projects/${project.id}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const item of techStack) {
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
