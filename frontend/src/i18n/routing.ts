import { defineRouting } from 'next-intl/routing';

/**
 * Desteklenen diller ve yerelleştirilmiş pathnames.
 * Dosya yolları İngilizce kalır; TR URL'ler pathnames ile map edilir.
 */
export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/about': {
      tr: '/hakkimda',
      en: '/about',
    },
    '/experience': {
      tr: '/deneyim',
      en: '/experience',
    },
    '/education': {
      tr: '/egitim',
      en: '/education',
    },
    '/tech-stack': {
      tr: '/teknoloji-yigini',
      en: '/tech-stack',
    },
    '/tech-stack/[id]': {
      tr: '/teknoloji-yigini/[id]',
      en: '/tech-stack/[id]',
    },
    '/projects': {
      tr: '/projeler',
      en: '/projects',
    },
    '/projects/[id]': {
      tr: '/projeler/[id]',
      en: '/projects/[id]',
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
