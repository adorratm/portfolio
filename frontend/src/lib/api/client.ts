/**
 * Backend API istemcisi.
 * Tüm içerik tek bundle endpoint'inden çekilir — yerel JSON dosyası yok.
 */

import type { ContentBundle, Locale } from '@/lib/api/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Locale'e göre tüm site içeriği (profil, ayarlar, projeler, UI metinleri).
 * Frontend sayfaları yalnızca bu fonksiyonu kullanmalı.
 */
export function fetchContentBundle(locale: Locale): Promise<ContentBundle> {
  return apiFetch<ContentBundle>(`/content/public/${locale}`);
}

/** Projeler sayfası — tüm yayında olan projeler */
export function fetchAllProjects(locale: Locale) {
  return apiFetch<ContentBundle['projects']>(`/projects/public/${locale}/all`);
}

/** Tek proje detayı */
export function fetchProjectById(locale: Locale, id: string) {
  return apiFetch<ContentBundle['projects'][number]>(
    `/projects/public/${locale}/${id}`,
  );
}

/** Tek teknoloji detayı */
export function fetchTechStackById(locale: Locale, id: string) {
  return apiFetch<ContentBundle['techStack'][number]>(
    `/tech-stack/public/${locale}/${id}`,
  );
}

export type { Locale, ContentBundle };
