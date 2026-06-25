import { SiteNav } from '@/components/layout/SiteNav';
import { AmbientBackground } from '@/components/effects/AmbientBackground';
import type { AppLocale } from '@/i18n/routing';
import type { SiteSettings } from '@/lib/api/types';

interface PageShellProps {
  locale: AppLocale;
  settings: SiteSettings | null;
  children: React.ReactNode;
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
  ambientDecor = false,
}: PageShellProps) {
  return (
    <>
      <SiteNav locale={locale} settings={settings} />
      <main className="relative min-h-screen pt-20 lg:pl-64">
        <AmbientBackground showFloatingDecor={ambientDecor} />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-12 md:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
