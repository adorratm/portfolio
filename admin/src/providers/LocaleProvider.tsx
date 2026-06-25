'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { adminApi } from '@/lib/api/client';
import type { ContentBundle, Locale } from '@/lib/api/types';
import { label } from '@/lib/api/types';

const STORAGE_KEY = 'admin_locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  bundle: ContentBundle | null;
  loading: boolean;
  /** Admin paneli UI metni — backend adminLabels */
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Admin paneli dil bağlamı.
 * Seçilen locale'in tüm içeriği backend'den çekilir (UI + CMS önizleme).
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr');
  const [bundle, setBundle] = useState<ContentBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === 'tr' || saved === 'en') setLocaleState(saved);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    adminApi
      .getPublicContent(locale)
      .then((data) => {
        if (!cancelled) setBundle(data);
      })
      .catch(() => {
        if (!cancelled) setBundle(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const t = useCallback(
    (key: string, fallback = key) =>
      label(bundle?.ui.admin ?? {}, key, fallback),
    [bundle],
  );

  const value = useMemo(
    () => ({ locale, setLocale, bundle, loading, t }),
    [locale, setLocale, bundle, loading, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContent(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocaleContent LocaleProvider içinde kullanılmalı');
  }
  return ctx;
}
