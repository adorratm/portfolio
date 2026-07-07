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
import { ConfirmDialog } from '@/components/cms/ConfirmDialog';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type { Project, ProjectStatus } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const emptyProject = (): Partial<Project> => ({
  title: '',
  description: '',
  category: '',
  technologies: [],
  imageUrl: '',
  imageKey: '',
  externalUrl: '',
  endpoint: '',
  status: 'active',
  sortOrder: 0,
  isFeatured: true,
  isPublished: true,
});

const statusColors: Record<ProjectStatus, string> = {
  active: 'text-dracula-green border-dracula-green/30 bg-dracula-green/10',
  staging: 'text-dracula-orange border-dracula-orange/30 bg-dracula-orange/10',
  archived: 'text-on-surface-variant border-outline-variant bg-surface-container',
};

export default function ProjectsCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const rows = await adminApi.getProjects();
    setProjects(rows.filter((p) => p.locale === locale));
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Projeler yüklenemedi.'));
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertProject({
        locale,
        id: editing.id,
        title: editing.title ?? '',
        description: editing.description ?? '',
        category: editing.category ?? '',
        technologies: editing.technologies ?? [],
        imageUrl: editing.imageUrl || undefined,
        imageKey: editing.imageKey || undefined,
        externalUrl: editing.externalUrl || undefined,
        endpoint: editing.endpoint || undefined,
        status: editing.status ?? 'active',
        sortOrder: editing.sortOrder ?? 0,
        isFeatured: editing.isFeatured ?? true,
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
      await adminApi.deleteProject(deleteTarget.id);
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
    <CmsPageLayout
      title="Proje Yönetimi"
      subtitle="Frontend proje kartları ve admin proje kaydı"
    >
      <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
            Project Registry
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditing(emptyProject());
              setSaved(false);
            }}
            className="rounded-lg bg-primary-container px-4 py-2 font-mono text-xs font-bold text-on-primary-container hover:shadow-[0_0_15px_rgba(189,147,249,0.3)]"
          >
            + Yeni Proje
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs uppercase text-on-surface-variant">
                <th className="px-6 py-4">Proje</th>
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Öne Çıkan</th>
                <th className="px-6 py-4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-surface-variant/30"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-on-surface">{p.title}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">
                    {p.endpoint ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {p.isFeatured ? '✓' : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing({ ...p });
                          setSaved(false);
                        }}
                        className="text-secondary hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="text-error hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    Henüz proje yok. Yeni proje ekleyin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="mt-6">
          <CmsPanel title={editing.id ? 'Projeyi Düzenle' : 'Yeni Proje'}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Başlık">
                <input
                  className={inputClass}
                  value={editing.title ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Kategori">
                <input
                  className={inputClass}
                  value={editing.category ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
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
            <FormField label="Teknolojiler (virgülle ayır)">
              <input
                className={inputClass}
                value={(editing.technologies ?? []).join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    technologies: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </FormField>
            <ImageUploader
              label="Proje Görseli"
              folder="projects"
              imageUrl={editing.imageUrl}
              imageKey={editing.imageKey}
              onChange={({ imageUrl, imageKey }) =>
                setEditing({ ...editing, imageUrl, imageKey })
              }
              onClear={() =>
                setEditing({ ...editing, imageUrl: '', imageKey: '' })
              }
            />
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Harici URL">
                <input
                  className={inputClass}
                  value={editing.externalUrl ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, externalUrl: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Endpoint (admin tablo)">
                <input
                  className={inputClass}
                  value={editing.endpoint ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, endpoint: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Durum">
                <select
                  className={inputClass}
                  value={editing.status ?? 'active'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as ProjectStatus,
                    })
                  }
                >
                  <option value="active">active</option>
                  <option value="staging">staging</option>
                  <option value="archived">archived</option>
                </select>
              </FormField>
              <FormField label="Sıra">
                <input
                  type="number"
                  className={inputClass}
                  value={editing.sortOrder ?? 0}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={editing.isFeatured ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, isFeatured: e.target.checked })
                  }
                />
                Öne çıkan (ana sayfa)
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
      {error && (
        <p className="mt-4 font-mono text-sm text-error">{error}</p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Projeyi Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" projesini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </CmsPageLayout>
  );
}
