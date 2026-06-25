import { defineRouting } from 'next-intl/routing';

/**
 * Desteklenen diller ve URL yapısı.
 * /tr → Türkçe, /en → İngilizce
 */
export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
