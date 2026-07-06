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
import type { Certification } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const emptyCertification = (): Partial<Certification> => ({
  name: '',
  issuer: '',
  issueDate: '',
  credentialUrl: '',
  description: '',
  sortOrder: 0,
  isPublished: true,
});

export default function CertificationCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [rows, setRows] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Partial<Certification> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const all = await adminApi.getCertifications();
    setRows(all.filter((r) => r.locale === locale));
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Sertifikalar yüklenemedi.'));
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertCertification({
        locale,
        id: editing.id,
        name: editing.name ?? '',
        issuer: editing.issuer ?? '',
        issueDate: editing.issueDate || undefined,
        credentialUrl: editing.credentialUrl || undefined,
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await adminApi.deleteCertification(deleteTarget.id);
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
      title="Sertifikalar"
      subtitle="/education sayfası sertifika & başarı kayıtları"
    >
      <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
            Certification Registry
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditing(emptyCertification());
              setSaved(false);
            }}
            className="rounded-lg bg-primary-container px-4 py-2 font-mono text-xs font-bold text-on-primary-container hover:shadow-[0_0_15px_rgba(189,147,249,0.3)]"
          >
            + Yeni Sertifika
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs uppercase text-on-surface-variant">
                <th className="px-6 py-4">Ad / Kurum</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-variant/30">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-on-surface">{r.name}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">
                      {r.issuer}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">{r.issueDate ?? '—'}</td>
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
                  <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">
                    Henüz sertifika yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="mt-6">
          <CmsPanel title={editing.id ? 'Sertifikayı Düzenle' : 'Yeni Sertifika'}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Sertifika Adı">
                <input
                  className={inputClass}
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </FormField>
              <FormField label="Veren Kurum">
                <input
                  className={inputClass}
                  value={editing.issuer ?? ''}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                />
              </FormField>
              <FormField label="Tarih" hint="ör. 2023">
                <input
                  className={inputClass}
                  value={editing.issueDate ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, issueDate: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Doğrulama URL">
                <input
                  className={inputClass}
                  value={editing.credentialUrl ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, credentialUrl: e.target.value })
                  }
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Sertifikayı Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" kaydını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </CmsPageLayout>
  );
}
