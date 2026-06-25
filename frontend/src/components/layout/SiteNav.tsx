'use client';

import Link from 'next/link';
import type { AppLocale } from '@/i18n/routing';
import type { SiteSettings } from '@/lib/api/types';

interface SiteNavProps {
  locale: AppLocale;
  settings: SiteSettings | null;
}

/**
 * Navigasyon — navItems tamamen backend siteSettings'den gelir.
 * Yerel çeviri dosyası kullanılmaz.
 */
export function SiteNav({ locale, settings }: SiteNavProps) {
  const brandName = settings?.brandName ?? 'Root@Portfolio';
  const navItems = settings?.navItems ?? [
    { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
  ];

  return (
    <>
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-background/80 px-8 py-4 backdrop-blur-md">
        <div className="font-mono text-sm font-bold text-secondary">{brandName}</div>
        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-sm text-on-surface-variant transition-colors hover:text-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Dil değiştirici — diğer locale'e geçiş */}
        <LocaleSwitcher current={locale} />
      </header>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low py-8 lg:flex">
        <div className="mb-12 px-6">
          <h2 className="font-mono text-sm font-bold text-primary">{brandName}</h2>
          {settings?.brandSubtitle && (
            <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">
              {settings.brandSubtitle}
            </p>
          )}
        </div>
        <nav className="grow">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-variant"
                >
                  <span className="font-mono text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

function LocaleSwitcher({ current }: { current: AppLocale }) {
  const other = current === 'tr' ? 'en' : 'tr';
  return (
    <Link
      href={`/${other}`}
      className="rounded border border-outline-variant px-3 py-1 font-mono text-xs uppercase text-on-surface-variant hover:text-secondary"
    >
      {other}
    </Link>
  );
}
