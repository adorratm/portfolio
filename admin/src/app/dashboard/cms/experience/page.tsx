'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CmsPageLayout,
  CmsPanel,
  FormField,
  inputClass,
  textareaClass,
} from '@/components/cms/CmsForm';
import { ConfirmDialog } from '@/components/cms/ConfirmDialog';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type { Experience } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const parseTechnologies = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const emptyExperience = (): Partial<Experience> => ({
  company: '',
  role: '',
  employmentType: '',
  location: '',
  period: '',
  description: '',
  highlights: [],
  technologies: [],
  isCurrent: false,
  sortOrder: 0,
  isPublished: true,
});

export default function ExperienceCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [rows, setRows] = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const all = await adminApi.getExperiences();
    setRows(all.filter((r) => r.locale === locale));
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Deneyimler yüklenemedi.'));
  }, [load]);

  const editingKey = editing ? (editing.id ?? 'new') : null;

  useEffect(() => {
    if (!editing) {
      setTechInput('');
      return;
    }
    setTechInput((editing.technologies ?? []).join(', '));
  }, [editingKey]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertExperience({
        locale,
        id: editing.id,
        company: editing.company ?? '',
        role: editing.role ?? '',
        employmentType: editing.employmentType || undefined,
        location: editing.location || undefined,
        period: editing.period ?? '',
        description: editing.description || undefined,
        highlights: editing.highlights ?? [],
        technologies: parseTechnologies(techInput),
        isCurrent: editing.isCurrent ?? false,
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await adminApi.deleteExperience(deleteTarget.id);
      await refreshBundle();
      await load();
      if (editing?.id === deleteTarget.id) setEditing(null);
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Silme başarısız.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <CmsPageLayout title="Deneyim" subtitle="/experience zaman çizelgesi kayıtları">
      <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
            Experience Registry
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditing(emptyExperience());
              setSaved(false);
            }}
            className="rounded-lg bg-primary-container px-4 py-2 font-mono text-xs font-bold text-on-primary-container hover:shadow-[0_0_15px_rgba(189,147,249,0.3)]"
          >
            + Yeni Deneyim
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs uppercase text-on-surface-variant">
                <th className="px-6 py-4">Rol / Şirket</th>
                <th className="px-6 py-4">Dönem</th>
                <th className="px-6 py-4">Güncel</th>
                <th className="px-6 py-4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-variant/30">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-on-surface">{r.role}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">
                      {r.company}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">{r.period}</td>
                  <td className="px-6 py-4 text-xs">{r.isCurrent ? '✓' : '—'}</td>
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
                        onClick={() => setDeleteTarget(r)}
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
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    Henüz deneyim yok. Yeni kayıt ekleyin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="mt-6">
          <CmsPanel title={editing.id ? 'Deneyimi Düzenle' : 'Yeni Deneyim'}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Rol / Ünvan">
                <input
                  className={inputClass}
                  value={editing.role ?? ''}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                />
              </FormField>
              <FormField label="Şirket">
                <input
                  className={inputClass}
                  value={editing.company ?? ''}
                  onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                />
              </FormField>
              <FormField label="Çalışma Türü">
                <input
                  className={inputClass}
                  placeholder="Tam Zamanlı"
                  value={editing.employmentType ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, employmentType: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Konum">
                <input
                  className={inputClass}
                  value={editing.location ?? ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </FormField>
              <FormField label="Dönem" hint="ör. 2021 — Günümüz">
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
            <FormField label="Öne Çıkanlar (her satır bir madde)">
              <textarea
                className={textareaClass}
                value={(editing.highlights ?? []).join('\n')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    highlights: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </FormField>
            <FormField label="Teknolojiler (virgülle ayır)">
              <input
                className={inputClass}
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onBlur={() =>
                  setEditing({
                    ...editing,
                    technologies: parseTechnologies(techInput),
                  })
                }
              />
            </FormField>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={editing.isCurrent ?? false}
                  onChange={(e) =>
                    setEditing({ ...editing, isCurrent: e.target.checked })
                  }
                />
                Halen devam ediyor
              </label>
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
            </div>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deneyim Kaydını Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.role}" — ${deleteTarget.company} kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </CmsPageLayout>
  );
}
