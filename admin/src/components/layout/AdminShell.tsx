'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocaleContent } from '@/providers/LocaleProvider';
import { clearStoredToken, getStoredToken } from '@/lib/api/client';

const CMS_NAV = [
  { href: '/dashboard', labelKey: 'nav.dashboard', fallback: 'Dashboard', icon: '◉' },
  { href: '/dashboard/cms/profile', labelKey: 'nav.profile', fallback: 'Profil / Hero', icon: '◎' },
  { href: '/dashboard/cms/about', labelKey: 'nav.about', fallback: 'Hakkımda', icon: '☰' },
  { href: '/dashboard/cms/experience', labelKey: 'nav.experience', fallback: 'Deneyim', icon: '▤' },
  { href: '/dashboard/cms/education', labelKey: 'nav.education', fallback: 'Eğitim', icon: '◧' },
  { href: '/dashboard/cms/certification', labelKey: 'nav.certifications', fallback: 'Sertifikalar', icon: '✦' },
  { href: '/dashboard/cms/site-settings', labelKey: 'nav.siteSettings', fallback: 'Site Ayarları', icon: '◇' },
  { href: '/dashboard/cms/projects', labelKey: 'nav.projects', fallback: 'Projeler', icon: '▸' },
  { href: '/dashboard/cms/tech-stack', labelKey: 'nav.techStack', fallback: 'Tech Stack', icon: '◈' },
] as const;

/**
 * Admin panel yan menü + üst bar — design/emre_k_l_admin_console ile uyumlu.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, bundle } = useLocaleContent();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getStoredToken());
  }, []);

  const brandName = bundle?.siteSettings?.brandName ?? 'Root@Portfolio';

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-background/80 px-6 py-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-secondary">
            System Monitor v1.0
          </span>
          <div className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1 md:flex">
            <div className="pulse-status h-2 w-2 rounded-full bg-dracula-green" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              NODE_01: ONLINE
            </span>
          </div>
        </div>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => {
              clearStoredToken();
              window.location.href = '/login';
            }}
            className="font-mono text-xs text-on-surface-variant transition-colors hover:text-secondary"
          >
            {t('nav.logout', 'Logout')}
          </button>
        )}
      </header>

      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low pt-24 md:flex">
        <div className="mb-8 px-6">
          <h2 className="font-mono text-sm font-bold text-primary">{brandName}</h2>
          <p className="font-mono text-xs text-on-surface-variant opacity-70">
            {bundle?.siteSettings?.brandSubtitle ?? 'Admin Console'}
          </p>
        </div>
        <nav className="flex grow flex-col">
          {CMS_NAV.map((item) => {
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 border-l-4 px-6 py-4 font-mono text-sm transition-all ${
                  active
                    ? 'border-primary bg-surface-container-highest font-bold text-primary'
                    : 'border-transparent text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                <span className="text-xs opacity-60">{item.icon}</span>
                {t(item.labelKey, item.fallback)}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-outline-variant p-6">
          <div className="mb-4 flex items-center justify-between font-mono text-xs text-on-surface-variant">
            <span>Logs</span>
            <span className="text-dracula-green">Active</span>
          </div>
          <div className="mb-4 flex items-center justify-between font-mono text-xs text-on-surface-variant">
            <span>Network</span>
            <span className="text-dracula-orange">124ms</span>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">{children}</div>
    </div>
  );
}
