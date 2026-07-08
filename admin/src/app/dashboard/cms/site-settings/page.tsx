'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CmsPageLayout,
  CmsPanel,
  FormField,
  SaveBar,
  inputClass,
  textareaClass,
} from '@/components/cms/CmsForm';
import { SocialLinksEditor } from '@/components/cms/SocialLinksEditor';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type { SiteSettings } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const emptySettings: Omit<SiteSettings, never> & { locale?: string } = {
  siteTitle: '',
  brandName: '',
  brandSubtitle: '',
  navItems: [],
  philosophyTitle: null,
  philosophyBody: null,
  philosophyPillars: [],
  statDeployments: '50+',
  statUptime: '99.9%',
  statDeploymentsLabel: null,
  statUptimeLabel: null,
  projectsSectionTitle: null,
  projectsViewAllLabel: null,
  footerTagline: null,
  contactFabLabel: null,
  contactFabUrl: null,
  socialLinks: [],
};

export default function SiteSettingsCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [form, setForm] = useState(emptySettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await adminApi.getSiteSettingsAll();
    const row = rows.find((r) => r.locale === locale);
    if (row) {
      setForm({
        siteTitle: row.siteTitle,
        brandName: row.brandName,
        brandSubtitle: row.brandSubtitle,
        navItems: row.navItems ?? [],
        philosophyTitle: row.philosophyTitle,
        philosophyBody: row.philosophyBody,
        philosophyPillars: row.philosophyPillars ?? [],
        statDeployments: row.statDeployments,
        statUptime: row.statUptime,
        statDeploymentsLabel: row.statDeploymentsLabel,
        statUptimeLabel: row.statUptimeLabel,
        projectsSectionTitle: row.projectsSectionTitle,
        projectsViewAllLabel: row.projectsViewAllLabel,
        footerTagline: row.footerTagline,
        contactFabLabel: row.contactFabLabel,
        contactFabUrl: row.contactFabUrl,
        socialLinks: row.socialLinks ?? [],
      });
    } else {
      setForm(emptySettings);
    }
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Ayarlar yüklenemedi.'));
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertSiteSettings({ locale, ...form });
      await refreshBundle();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CmsPageLayout
      title="Site Ayarları"
      subtitle="Navigasyon, marka, felsefe, istatistikler ve footer"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <CmsPanel title="Marka & Navigasyon">
          <FormField label="Site Başlığı (title)">
            <input
              className={inputClass}
              value={form.siteTitle}
              onChange={(e) => {
                setForm({ ...form, siteTitle: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Marka Adı">
            <input
              className={inputClass}
              value={form.brandName}
              onChange={(e) => {
                setForm({ ...form, brandName: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Marka Alt Başlık">
            <input
              className={inputClass}
              value={form.brandSubtitle}
              onChange={(e) => {
                setForm({ ...form, brandSubtitle: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Navigasyon (JSON)" hint="[{ label, href }]">
            <textarea
              className={`${textareaClass} min-h-32`}
              value={JSON.stringify(form.navItems, null, 2)}
              onChange={(e) => {
                try {
                  setForm({ ...form, navItems: JSON.parse(e.target.value) });
                  setSaved(false);
                } catch {
                  /* geçersiz JSON — kullanıcı yazmaya devam edebilir */
                }
              }}
            />
          </FormField>
        </CmsPanel>

        <CmsPanel title="İstatistikler & Projeler Bölümü">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Dağıtım Sayısı">
              <input
                className={inputClass}
                value={form.statDeployments}
                onChange={(e) => {
                  setForm({ ...form, statDeployments: e.target.value });
                  setSaved(false);
                }}
              />
            </FormField>
            <FormField label="Dağıtım Etiketi">
              <input
                className={inputClass}
                value={form.statDeploymentsLabel ?? ''}
                onChange={(e) => {
                  setForm({ ...form, statDeploymentsLabel: e.target.value });
                  setSaved(false);
                }}
              />
            </FormField>
            <FormField label="Uptime">
              <input
                className={inputClass}
                value={form.statUptime}
                onChange={(e) => {
                  setForm({ ...form, statUptime: e.target.value });
                  setSaved(false);
                }}
              />
            </FormField>
            <FormField label="Uptime Etiketi">
              <input
                className={inputClass}
                value={form.statUptimeLabel ?? ''}
                onChange={(e) => {
                  setForm({ ...form, statUptimeLabel: e.target.value });
                  setSaved(false);
                }}
              />
            </FormField>
          </div>
          <FormField label="Projeler Bölüm Başlığı">
            <input
              className={inputClass}
              value={form.projectsSectionTitle ?? ''}
              onChange={(e) => {
                setForm({ ...form, projectsSectionTitle: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Tümünü Gör Etiketi">
            <input
              className={inputClass}
              value={form.projectsViewAllLabel ?? ''}
              onChange={(e) => {
                setForm({ ...form, projectsViewAllLabel: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
        </CmsPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CmsPanel title="Teknik Felsefe">
          <FormField label="Başlık">
            <input
              className={inputClass}
              value={form.philosophyTitle ?? ''}
              onChange={(e) => {
                setForm({ ...form, philosophyTitle: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Metin">
            <textarea
              className={textareaClass}
              value={form.philosophyBody ?? ''}
              onChange={(e) => {
                setForm({ ...form, philosophyBody: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Sütunlar (JSON)" hint='[{ "label": "...", "color": "green" }]'>
            <textarea
              className={`${textareaClass} min-h-24`}
              value={JSON.stringify(form.philosophyPillars, null, 2)}
              onChange={(e) => {
                try {
                  setForm({ ...form, philosophyPillars: JSON.parse(e.target.value) });
                  setSaved(false);
                } catch {
                  /* */
                }
              }}
            />
          </FormField>
        </CmsPanel>

        <CmsPanel title="Footer & İletişim">
          <FormField label="Footer Tagline">
            <input
              className={inputClass}
              value={form.footerTagline ?? ''}
              onChange={(e) => {
                setForm({ ...form, footerTagline: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="İletişim FAB Etiketi">
            <input
              className={inputClass}
              value={form.contactFabLabel ?? ''}
              onChange={(e) => {
                setForm({ ...form, contactFabLabel: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="İletişim FAB URL">
            <input
              className={inputClass}
              value={form.contactFabUrl ?? ''}
              onChange={(e) => {
                setForm({ ...form, contactFabUrl: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField
            label="Sosyal Linkler"
            hint="Platform seçin, ad ve URL girin. İkonlar otomatik atanır."
          >
            <SocialLinksEditor
              value={form.socialLinks}
              onChange={(socialLinks) => {
                setForm({ ...form, socialLinks });
                setSaved(false);
              }}
            />
          </FormField>
        </CmsPanel>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={handleSave}
        onCancel={() => load()}
      />
    </CmsPageLayout>
  );
}
