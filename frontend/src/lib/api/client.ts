/**
 * Backend API istemcisi.
 * Tüm içerik tek bundle endpoint'inden çekilir — yerel JSON dosyası yok.
 *
 * SSR'da API_INTERNAL_URL tercih edilir (Docker ağı → backend).
 * NEXT_PUBLIC_API_URL Cloudflare üzerinden hairpin / bot challenge'a düşebilir.
 */

import type { ContentBundle, Locale } from '@/lib/api/types';

function apiBase(): string {
  if (typeof window === 'undefined') {
    const internal = process.env.API_INTERNAL_URL?.trim();
    if (internal) return internal.replace(/\/$/, '');
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
    'http://localhost:3001/api/v1'
  );
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
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

/** Tek proje detayı (UUID veya slug) */
export function fetchProjectById(locale: Locale, idOrSlug: string) {
  return apiFetch<ContentBundle['projects'][number]>(
    `/projects/public/${locale}/${encodeURIComponent(idOrSlug)}`,
  );
}

/** Tek teknoloji detayı (UUID veya slug) */
export function fetchTechStackById(locale: Locale, idOrSlug: string) {
  return apiFetch<ContentBundle['techStack'][number]>(
    `/tech-stack/public/${locale}/${encodeURIComponent(idOrSlug)}`,
  );
}

export type { Locale, ContentBundle };
