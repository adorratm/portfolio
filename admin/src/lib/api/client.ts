/**
 * Admin API istemcisi — JWT + content bundle + CMS CRUD.
 */

import type {
  AboutContent,
  AdminContentBundles,
  Certification,
  ContentBundle,
  EducationItem,
  Experience,
  Locale,
  ProfileContent,
  Project,
  SiteSettings,
  TechStackItem,
} from '@/lib/api/types';

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
    const text = await response.text().catch(() => '');
    throw new Error(text || `API hatası: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
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

  getPublicContent: (locale: Locale) =>
    publicFetch<ContentBundle>(`/content/public/${locale}`),

  getAllContent: () => adminFetch<AdminContentBundles>('/content/admin/all'),

  getProfiles: () => adminFetch<ProfileContent[]>('/profile'),

  upsertProfile: (body: ProfileContent & { locale: Locale }) =>
    adminFetch<ProfileContent>('/profile', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getSiteSettingsAll: () => adminFetch<SiteSettings[]>('/site-settings'),

  upsertSiteSettings: (body: SiteSettings & { locale: Locale }) =>
    adminFetch<SiteSettings>('/site-settings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getProjects: () => adminFetch<Project[]>('/projects'),

  upsertProject: (body: Partial<Project> & { locale: Locale; title: string; description: string; category: string; technologies: string[] }) =>
    adminFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteProject: (id: string) =>
    adminFetch<void>(`/projects/${id}`, { method: 'DELETE' }),

  getTechStack: () => adminFetch<TechStackItem[]>('/tech-stack'),

  upsertTechStack: (body: Partial<TechStackItem> & { locale: Locale; name: string; category: string }) =>
    adminFetch<TechStackItem>('/tech-stack', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteTechStack: (id: string) =>
    adminFetch<void>(`/tech-stack/${id}`, { method: 'DELETE' }),

  getAboutAll: () => adminFetch<AboutContent[]>('/about'),

  upsertAbout: (body: AboutContent & { locale: Locale }) =>
    adminFetch<AboutContent>('/about', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getExperiences: () => adminFetch<Experience[]>('/experience'),

  upsertExperience: (
    body: Partial<Experience> & {
      locale: Locale;
      company: string;
      role: string;
      period: string;
      highlights: string[];
      technologies: string[];
    },
  ) =>
    adminFetch<Experience>('/experience', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteExperience: (id: string) =>
    adminFetch<void>(`/experience/${id}`, { method: 'DELETE' }),

  getEducation: () => adminFetch<EducationItem[]>('/education'),

  upsertEducation: (
    body: Partial<EducationItem> & {
      locale: Locale;
      institution: string;
      degree: string;
      period: string;
    },
  ) =>
    adminFetch<EducationItem>('/education', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteEducation: (id: string) =>
    adminFetch<void>(`/education/${id}`, { method: 'DELETE' }),

  getCertifications: () => adminFetch<Certification[]>('/certification'),

  upsertCertification: (
    body: Partial<Certification> & {
      locale: Locale;
      name: string;
      issuer: string;
    },
  ) =>
    adminFetch<Certification>('/certification', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  deleteCertification: (id: string) =>
    adminFetch<void>(`/certification/${id}`, { method: 'DELETE' }),

  uploadMedia: async (file: File, folder = 'uploads') => {
    const token = getStoredToken();
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);

    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (response.status === 401) {
      clearStoredToken();
      throw new Error('Oturum süresi doldu.');
    }
    if (!response.ok) {
      throw new Error(`Yükleme hatası: ${response.status}`);
    }
    return response.json() as Promise<{ key: string; publicUrl: string }>;
  },

  deleteMedia: (key: string) =>
    adminFetch<void>('/media', {
      method: 'DELETE',
      body: JSON.stringify({ key }),
    }),
};
