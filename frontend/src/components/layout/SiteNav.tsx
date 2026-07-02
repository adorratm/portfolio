'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AppLocale } from '@/i18n/routing';
import type { ProfileContent, SiteSettings } from '@/lib/api/types';

interface SiteNavProps {
  locale: AppLocale;
  settings: SiteSettings | null;
  profile?: ProfileContent | null;
}

type NavItem = { label: string; href: string; icon?: string };
type SocialLink = { type: string; url: string; icon: string };

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

function SocialRow({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {links.map((social) => (
        <a
          key={`${social.type}-${social.url}`}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          title={social.type}
          aria-label={social.type}
          className="glow-hover flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-sm text-on-surface-variant transition-all hover:border-primary hover:text-primary active:scale-95"
        >
          {social.icon?.trim() ? social.icon : social.type.slice(0, 1).toUpperCase()}
        </a>
      ))}
    </div>
  );
}

/**
 * Navigasyon — navItems tamamen backend siteSettings'den gelir.
 * Header sabit yükseklik (h-16); sidebar (lg+) ve mobil açılır menü (< lg).
 */
export function SiteNav({ locale, settings, profile }: SiteNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandName = settings?.brandName ?? 'Root@Portfolio';
  const navItems: NavItem[] = settings?.navItems ?? [
    { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
  ];
  const socialLinks = (settings?.socialLinks ?? []) as SocialLink[];
  const profileImage = profile?.imageUrl ?? null;

  // Rota değişince mobil menüyü kapat
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sideLinkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return `group flex items-center gap-3 rounded-lg px-4 py-3 font-mono text-sm transition-all duration-200 ease-in-out active:scale-95 ${
      active
        ? 'border-l-4 border-primary bg-surface-container-highest font-bold text-primary shadow-[0_0_15px_rgba(189,147,249,0.1)]'
        : 'border-l-4 border-transparent text-on-surface-variant hover:bg-surface-variant'
    }`;
  };

  const topLinkClass = (href: string) => {
    const active = navIsActive(pathname, href);
    return `font-mono text-sm transition-all active:scale-95 ${
      active
        ? 'border-b-2 border-primary text-primary'
        : 'text-on-surface-variant hover:text-secondary'
    }`;
  };

  return (
    <>
      {/* ——— Üst header (tüm ekranlar, sabit h-16) ——— */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-outline-variant bg-background/80 px-4 backdrop-blur-md md:px-8">
        <div className="font-mono text-sm font-bold text-secondary">{brandName}</div>

        <nav className="hidden gap-6 md:flex lg:gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={topLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary md:hidden"
          >
            <span className="text-lg leading-none">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </header>

      {/* ——— Mobil açılır menü (< md) ——— */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-background/40 backdrop-blur-sm md:hidden"
        />
      )}
      <div
        className={`fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-outline-variant bg-surface-container-low/95 backdrop-blur-md transition-all duration-200 md:hidden ${
          mobileOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0'
        }`}
      >
        <div className="space-y-6 px-6 py-6">
          <ProfileBadge
            profileImage={profileImage}
            brandName={brandName}
            subtitle={settings?.brandSubtitle}
          />
          <SocialRow links={socialLinks} />
          <nav>
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
        </div>
      </div>

      {/* ——— Masaüstü sidebar (lg+) — header yüksekliği kadar aşağıdan başlar ——— */}
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100dvh-4rem)] w-64 flex-col border-r border-outline-variant bg-surface-container-low py-8 lg:flex">
        <div className="mb-10 space-y-4 px-6">
          <ProfileBadge
            profileImage={profileImage}
            brandName={brandName}
            subtitle={settings?.brandSubtitle}
          />
          <SocialRow links={socialLinks} />
        </div>
        <nav className="grow overflow-y-auto px-3">
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
