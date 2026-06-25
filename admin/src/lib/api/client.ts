/**
 * Admin API istemcisi — JWT + content bundle.
 */

import type { AdminContentBundles, ContentBundle, Locale } from '@/lib/api/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('admin_token');
}

export function getGoogleLoginUrl(): string {
  return `${API_BASE}/auth/google`;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    clearStoredToken();
    throw new Error('Oturum süresi doldu.');
  }

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function publicFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`API hatası: ${response.status}`);
  return response.json() as Promise<T>;
}

export const adminApi = {
  me: () => adminFetch('/auth/me'),

  /** Giriş öncesi — panel UI metinleri için public bundle */
  getPublicContent: (locale: Locale) =>
    publicFetch<ContentBundle>(`/content/public/${locale}`),

  /** Giriş sonrası — TR + EN tüm CMS verisi */
  getAllContent: () => adminFetch<AdminContentBundles>('/content/admin/all'),
};
