'use client';

import { useCallback, useEffect, useState } from 'react';
import { ImageUploader } from '@/components/cms/ImageUploader';
import {
  CmsPageLayout,
  CmsPanel,
  FormField,
  SaveBar,
  inputClass,
  textareaClass,
} from '@/components/cms/CmsForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import { useLocaleContent } from '@/providers/LocaleProvider';

interface TerminalLine {
  label: string;
  value: string;
  link?: string;
}

const emptyProfile = {
  badgeText: '',
  headlinePrefix: '',
  headlineHighlight: '',
  bio: '',
  terminalLines: [] as TerminalLine[],
  imageKey: null as string | null,
  imageUrl: null as string | null,
};

export default function ProfileCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [form, setForm] = useState(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await adminApi.getProfiles();
    const row = rows.find((r) => r.locale === locale);
    if (row) {
      setForm({
        badgeText: row.badgeText,
        headlinePrefix: row.headlinePrefix,
        headlineHighlight: row.headlineHighlight,
        bio: row.bio,
        terminalLines: row.terminalLines ?? [],
        imageKey: row.imageKey ?? null,
        imageUrl: row.imageUrl ?? null,
      });
    } else {
      setForm(emptyProfile);
    }
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Profil yüklenemedi.'));
  }, [load]);

  const updateLine = (index: number, field: keyof TerminalLine, value: string) => {
    setForm((prev) => {
      const lines = [...prev.terminalLines];
      lines[index] = { ...lines[index], [field]: value };
      return { ...prev, terminalLines: lines };
    });
    setSaved(false);
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      terminalLines: [...prev.terminalLines, { label: '', value: '' }],
    }));
    setSaved(false);
  };

  const removeLine = (index: number) => {
    setForm((prev) => ({
      ...prev,
      terminalLines: prev.terminalLines.filter((_, i) => i !== index),
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertProfile({ locale, ...form });
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
      title="Profil / Hero"
      subtitle="Ana sayfa hero, badge ve terminal (neofetch) içeriği"
    >
      <CmsPanel title="Başlık & Bio">
        <ImageUploader
          label="Profil Görseli"
          folder="profile"
          imageUrl={form.imageUrl}
          imageKey={form.imageKey}
          onChange={({ imageUrl, imageKey }) => {
            setForm({ ...form, imageUrl, imageKey });
            setSaved(false);
          }}
          onClear={() => {
            setForm({ ...form, imageUrl: null, imageKey: null });
            setSaved(false);
          }}
        />
        <FormField label="Badge Metni">
          <input
            className={inputClass}
            value={form.badgeText}
            onChange={(e) => {
              setForm({ ...form, badgeText: e.target.value });
              setSaved(false);
            }}
          />
        </FormField>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Başlık Öneki">
            <input
              className={inputClass}
              value={form.headlinePrefix}
              onChange={(e) => {
                setForm({ ...form, headlinePrefix: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
          <FormField label="Vurgulu Başlık">
            <input
              className={inputClass}
              value={form.headlineHighlight}
              onChange={(e) => {
                setForm({ ...form, headlineHighlight: e.target.value });
                setSaved(false);
              }}
            />
          </FormField>
        </div>
        <FormField label="Bio">
          <textarea
            className={textareaClass}
            value={form.bio}
            onChange={(e) => {
              setForm({ ...form, bio: e.target.value });
              setSaved(false);
            }}
          />
        </FormField>
      </CmsPanel>

      <div className="mt-6">
        <CmsPanel title="Terminal Satırları (neofetch)">
          {form.terminalLines.map((line, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-outline-variant/30 bg-surface-container p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <input
                className={inputClass}
                placeholder="Label"
                value={line.label}
                onChange={(e) => updateLine(i, 'label', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Value"
                value={line.value}
                onChange={(e) => updateLine(i, 'value', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Link (opsiyonel)"
                value={line.link ?? ''}
                onChange={(e) => updateLine(i, 'link', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="font-mono text-xs text-error hover:underline"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg border border-dashed border-outline-variant px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-variant"
          >
            + Satır Ekle
          </button>
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
