'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AppLocale } from '@/i18n/routing';
import { SocialLinks } from '@/components/layout/SocialLinks';
import type { ProfileContent, SiteSettings } from '@/lib/api/types';

interface SiteNavProps {
  locale: AppLocale;
  settings: SiteSettings | null;
  profile?: ProfileContent | null;
}

type NavItem = { label: string; href: string; icon?: string };

function navIsActive(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, '');
  const target = href.replace(/\/$/, '');
  if (/^\/(tr|en)$/.test(target)) {
    return normalized === target;
  }
  return normalized === target || normalized.startsWith(`${target}/`);
}

function ProfileBadge({
  profileImage,
  brandName,
  subtitle,
}: {
  profileImage: string | null;
  brandName: string;
  subtitle?: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {profileImage ? (
        <div className="pulse-animation relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary shadow-[0_0_20px_rgba(189,147,249,0.35)]">
          <Image
            src={profileImage}
            alt={brandName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-container">
          <span className="text-lg text-on-primary">⚡</span>
        </div>
      )}
      <div>
        <h2 className="font-mono text-sm font-bold text-primary">{brandName}</h2>
        {subtitle && (
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Navigasyon — navItems tamamen backend siteSettings'den gelir.
 * < lg: hamburger + sol çekmece; lg+: sabit sidebar.
 */
export function SiteNav({ locale, settings, profile }: SiteNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const brandName = settings?.brandName ?? 'Root@Portfolio';
  const navItems: NavItem[] = settings?.navItems ?? [
    { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
  ];
  const socialLinks = settings?.socialLinks ?? [];
  const profileImage = profile?.imageUrl ?? null;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const sideLinkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return `group flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-sm transition-all duration-200 ease-in-out active:scale-95 ${
      active
        ? 'border-l-4 border-primary bg-surface-container-highest font-bold text-primary shadow-[0_0_15px_rgba(189,147,249,0.1)]'
        : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-variant'
    }`;
  };

  const navList = (
    <ul className="space-y-1">
      {navItems.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={sideLinkClass(item.href)}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* ——— Üst header ——— */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-outline-variant bg-background/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="min-w-0 truncate font-mono text-sm font-bold text-secondary transition-colors hover:text-primary"
        >
          {brandName}
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LocaleSwitcher current={locale} />
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={drawerOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <span className="text-lg leading-none">{drawerOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </header>

      {/* ——— Mobil / tablet çekmece (< lg) ——— */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-background/50 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        aria-hidden={!drawerOpen}
        className={`fixed top-16 left-0 z-40 flex h-[calc(100dvh-4rem)] w-72 max-w-[min(85vw,20rem)] flex-col border-r border-outline-variant bg-surface-container-low/95 shadow-xl backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        }`}
      >
        <div className="space-y-5 border-b border-outline-variant/40 px-5 py-6">
          <ProfileBadge
            profileImage={profileImage}
            brandName={brandName}
            subtitle={settings?.brandSubtitle}
          />
          <SocialLinks links={socialLinks} />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">{navList}</nav>
      </aside>

      {/* ——— Masaüstü sidebar (lg+) ——— */}
      <aside className="fixed top-16 left-0 z-40 hidden h-[calc(100dvh-4rem)] w-64 flex-col border-r border-outline-variant bg-surface-container-low py-8 lg:flex">
        <div className="mb-10 space-y-4 px-6">
          <ProfileBadge
            profileImage={profileImage}
            brandName={brandName}
            subtitle={settings?.brandSubtitle}
          />
          <SocialLinks links={socialLinks} />
        </div>
        <nav className="grow overflow-y-auto px-3">{navList}</nav>
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
