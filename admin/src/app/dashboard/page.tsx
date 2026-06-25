'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MetricsBento } from '@/components/dashboard/MetricsBento';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { ContentPreview } from '@/components/dashboard/ContentPreview';
import { AdminShell } from '@/components/layout/AdminShell';
import { useLocaleContent } from '@/providers/LocaleProvider';
import { getStoredToken } from '@/lib/api/client';

const CMS_MODULES = [
  {
    href: '/dashboard/cms/profile',
    title: 'Profil / Hero',
    desc: 'Badge, başlık, bio, terminal satırları',
  },
  {
    href: '/dashboard/cms/site-settings',
    title: 'Site Ayarları',
    desc: 'Nav, marka, felsefe, istatistikler, footer',
  },
  {
    href: '/dashboard/cms/projects',
    title: 'Projeler',
    desc: 'Proje kartları ve registry tablosu',
  },
  {
    href: '/dashboard/cms/tech-stack',
    title: 'Teknoloji Yığını',
    desc: 'Yetkinlik matrisi öğeleri',
  },
] as const;

export default function DashboardPage() {
  const { t, bundle, loading } = useLocaleContent();
  const router = useRouter();

  useEffect(() => {
    if (!getStoredToken()) router.replace('/login');
  }, [router]);

  return (
    <AdminShell>
      <main className="mx-auto max-w-360 px-6 py-24 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold">
              {t('dashboard.title', 'Admin Dashboard')}
            </h1>
            <p className="text-on-surface-variant">
              {t('dashboard.subtitle', 'System health and CMS.')}
            </p>
          </div>
          <LocaleSwitcher />
        </div>

        <MetricsBento />

        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold">
            {t('dashboard.cmsTitle', 'CMS Modülleri')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CMS_MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 transition-all hover:border-primary/40 hover:shadow-[0_0_15px_rgba(189,147,249,0.15)]"
              >
                <h4 className="mb-1 font-mono text-sm font-bold text-primary group-hover:text-secondary">
                  {mod.title}
                </h4>
                <p className="text-sm text-on-surface-variant">{mod.desc}</p>
                <span className="mt-3 inline-block font-mono text-xs text-tertiary">
                  Düzenle →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {!loading && bundle && <ContentPreview bundle={bundle} />}
      </main>
    </AdminShell>
  );
}
