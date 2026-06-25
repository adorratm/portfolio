'use client';

import { MetricsBento } from '@/components/dashboard/MetricsBento';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { ContentPreview } from '@/components/dashboard/ContentPreview';
import { useLocaleContent } from '@/providers/LocaleProvider';

/**
 * Dashboard — panel metinleri + seçili locale CMS önizlemesi backend'den.
 */
export default function DashboardPage() {
  const { t, bundle, loading } = useLocaleContent();

  return (
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

      <section className="mb-10 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {t('dashboard.cmsTitle', 'CMS Modules')}
        </h3>
        <ul className="grid gap-2 font-mono text-sm text-on-surface-variant">
          <li>• Profil / Hero</li>
          <li>• Projeler ({bundle?.projects.length ?? 0})</li>
          <li>• Teknoloji Yığını ({bundle?.techStack.length ?? 0})</li>
          <li>• Site Ayarları</li>
        </ul>
      </section>

      {!loading && bundle && <ContentPreview bundle={bundle} />}
    </main>
  );
}
