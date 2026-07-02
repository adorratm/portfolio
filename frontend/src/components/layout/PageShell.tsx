import { SiteNav } from '@/components/layout/SiteNav';
import { AmbientBackground } from '@/components/effects/AmbientBackground';
import type { AppLocale } from '@/i18n/routing';
import type { ProfileContent, SiteSettings } from '@/lib/api/types';

interface PageShellProps {
  locale: AppLocale;
  settings: SiteSettings | null;
  children: React.ReactNode;
  /** Sol menüdeki profil görseli için */
  profile?: ProfileContent | null;
  /** Ana sayfa tarzı yüzen dekor ikonları */
  ambientDecor?: boolean;
}

/**
 * Ortak sayfa sarmalayıcı — nav + animasyonlu arka plan.
 */
export function PageShell({
  locale,
  settings,
  children,
  profile = null,
  ambientDecor = false,
}: PageShellProps) {
  return (
    <>
      <SiteNav locale={locale} settings={settings} profile={profile} />
      <main className="relative min-h-screen pt-20 lg:pl-64">
        <AmbientBackground showFloatingDecor={ambientDecor} />
        <div className="relative z-10 mx-auto max-w-360 px-4 py-12 md:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
