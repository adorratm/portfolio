'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CmsPageLayout,
  CmsPanel,
  FormField,
  inputClass,
  textareaClass,
} from '@/components/cms/CmsForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type { EducationItem } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const emptyEducation = (): Partial<EducationItem> => ({
  institution: '',
  degree: '',
  field: '',
  period: '',
  description: '',
  sortOrder: 0,
  isPublished: true,
});

export default function EducationCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [rows, setRows] = useState<EducationItem[]>([]);
  const [editing, setEditing] = useState<Partial<EducationItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const all = await adminApi.getEducation();
    setRows(all.filter((r) => r.locale === locale));
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Eğitim kayıtları yüklenemedi.'));
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertEducation({
        locale,
        id: editing.id,
        institution: editing.institution ?? '',
        degree: editing.degree ?? '',
        field: editing.field || undefined,
        period: editing.period ?? '',
        description: editing.description || undefined,
        sortOrder: editing.sortOrder ?? 0,
        isPublished: editing.isPublished ?? true,
      });
      await refreshBundle();
      await load();
      setEditing(null);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu eğitim kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await adminApi.deleteEducation(id);
      await refreshBundle();
      await load();
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Silme başarısız.');
    }
  };

  return (
    <CmsPageLayout title="Eğitim" subtitle="/education sayfası eğitim kayıtları">
      <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
            Education Registry
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditing(emptyEducation());
              setSaved(false);
            }}
            className="rounded-lg bg-primary-container px-4 py-2 font-mono text-xs font-bold text-on-primary-container hover:shadow-[0_0_15px_rgba(189,147,249,0.3)]"
          >
            + Yeni Kayıt
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs uppercase text-on-surface-variant">
                <th className="px-6 py-4">Derece / Kurum</th>
                <th className="px-6 py-4">Dönem</th>
                <th className="px-6 py-4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-variant/30">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-on-surface">{r.degree}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">
                      {r.institution}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">{r.period}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing({ ...r });
                          setSaved(false);
                        }}
                        className="text-secondary hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="text-error hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">
                    Henüz eğitim kaydı yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="mt-6">
          <CmsPanel title={editing.id ? 'Kaydı Düzenle' : 'Yeni Kayıt'}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Derece">
                <input
                  className={inputClass}
                  value={editing.degree ?? ''}
                  onChange={(e) => setEditing({ ...editing, degree: e.target.value })}
                />
              </FormField>
              <FormField label="Kurum">
                <input
                  className={inputClass}
                  value={editing.institution ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, institution: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Alan / Bölüm">
                <input
                  className={inputClass}
                  value={editing.field ?? ''}
                  onChange={(e) => setEditing({ ...editing, field: e.target.value })}
                />
              </FormField>
              <FormField label="Dönem" hint="ör. 2014 — 2018">
                <input
                  className={inputClass}
                  value={editing.period ?? ''}
                  onChange={(e) => setEditing({ ...editing, period: e.target.value })}
                />
              </FormField>
              <FormField label="Sıra">
                <input
                  type="number"
                  className={inputClass}
                  value={editing.sortOrder ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, sortOrder: Number(e.target.value) })
                  }
                />
              </FormField>
            </div>
            <FormField label="Açıklama">
              <textarea
                className={textareaClass}
                value={editing.description ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </FormField>
            <label className="flex items-center gap-2 font-mono text-sm">
              <input
                type="checkbox"
                checked={editing.isPublished ?? true}
                onChange={(e) =>
                  setEditing({ ...editing, isPublished: e.target.checked })
                }
              />
              Yayında
            </label>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary-container px-6 py-2 font-mono text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-sm text-on-surface-variant"
              >
                İptal
              </button>
            </div>
          </CmsPanel>
        </div>
      )}

      {saved && !editing && (
        <p className="mt-4 font-mono text-sm text-dracula-green">✓ Kaydedildi</p>
      )}
      {error && <p className="mt-4 font-mono text-sm text-error">{error}</p>}
    </CmsPageLayout>
  );
}
