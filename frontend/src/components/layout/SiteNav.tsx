'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppLocale } from '@/i18n/routing';
import type { SiteSettings } from '@/lib/api/types';

interface SiteNavProps {
  locale: AppLocale;
  settings: SiteSettings | null;
}

function navIsActive(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, '');
  const target = href.replace(/\/$/, '');
  if (/^\/(tr|en)$/.test(target)) {
    return normalized === target;
  }
  return normalized === target || normalized.startsWith(`${target}/`);
}

/**
 * Navigasyon — navItems tamamen backend siteSettings'den gelir.
 */
export function SiteNav({ locale, settings }: SiteNavProps) {
  const pathname = usePathname();
  const brandName = settings?.brandName ?? 'Root@Portfolio';
  const navItems = settings?.navItems ?? [
    { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
  ];

  const topLinkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return `font-mono text-sm transition-all active:scale-95 ${
      active
        ? 'border-b-2 border-primary text-primary'
        : 'text-on-surface-variant hover:text-secondary'
    }`;
  };

  const sideLinkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return `group flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-sm transition-all duration-200 ease-in-out active:scale-95 ${
      active
        ? 'border-l-4 border-primary bg-surface-container-highest font-bold text-primary shadow-[0_0_15px_rgba(189,147,249,0.1)]'
        : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-variant'
    }`;
  };

  return (
    <>
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-background/80 px-8 py-4 backdrop-blur-md">
        <div className="font-mono text-sm font-bold text-secondary">{brandName}</div>
        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={topLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <LocaleSwitcher current={locale} />
      </header>

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low py-8 lg:flex">
        <div className="mb-12 px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container">
              <span className="text-on-primary-container">⚡</span>
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-primary">{brandName}</h2>
              {settings?.brandSubtitle && (
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {settings.brandSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <nav className="grow px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={sideLinkClass(item.href)}>
                  {item.label}
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
  const pathname = usePathname();
  const other: AppLocale = current === 'tr' ? 'en' : 'tr';
  const href = pathname.replace(`/${current}`, `/${other}`);

  return (
    <Link
      href={href}
      className="rounded border border-outline-variant px-3 py-1 font-mono text-xs uppercase text-on-surface-variant transition-colors hover:text-secondary"
    >
      {other}
    </Link>
  );
}
