'use client';

import { useEffect } from 'react';
import type { AppLocale } from '@/i18n/routing';

/** Kök layout'taki sabit lang değerini locale'e göre günceller. */
export function LangAttribute({ locale }: { locale: AppLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
