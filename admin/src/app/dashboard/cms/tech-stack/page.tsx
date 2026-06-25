'use client';

import { useCallback, useEffect, useState } from 'react';
import { ImageUploader } from '@/components/cms/ImageUploader';
import {
  CmsPageLayout,
  CmsPanel,
  FormField,
  inputClass,
  textareaClass,
} from '@/components/cms/CmsForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type { TechStackItem } from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

const emptyItem = (): Partial<TechStackItem> => ({
  name: '',
  description: '',
  category: 'Backend',
  iconName: '',
  proficiencyLevel: 80,
  yearsExperience: null,
  sortOrder: 0,
  isPublished: true,
});

export default function TechStackCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [items, setItems] = useState<TechStackItem[]>([]);
  const [editing, setEditing] = useState<Partial<TechStackItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await adminApi.getTechStack();
    setItems(rows.filter((t) => t.locale === locale));
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Tech stack yüklenemedi.'));
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertTechStack({
        locale,
        id: editing.id,
        name: editing.name ?? '',
        category: editing.category ?? '',
        description: editing.description || undefined,
        iconName: editing.iconName || undefined,
        imageKey: editing.imageKey || undefined,
        imageUrl: editing.imageUrl || undefined,
        proficiencyLevel: editing.proficiencyLevel ?? 80,
        yearsExperience: editing.yearsExperience ?? undefined,
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
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;
    try {
      await adminApi.deleteTechStack(id);
      await refreshBundle();
      await load();
      if (editing?.id === id) setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Silme başarısız.');
    }
  };

  const grouped = items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const cat = item.category || 'Diğer';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <CmsPageLayout
      title="Teknoloji Yığını"
      subtitle="Tech stack sayfası yetkinlik matrisi"
    >
      <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
            Mevcut Öğeler ({items.length})
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditing(emptyItem());
              setSaved(false);
            }}
            className="rounded-lg bg-primary-container px-4 py-2 font-mono text-xs font-bold text-on-primary-container"
          >
            + Yeni Teknoloji
          </button>
        </div>

        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="mb-3 font-mono text-xs uppercase text-secondary">
              {category}
            </h3>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container px-4 py-3"
                >
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <span className="ml-3 font-mono text-xs text-secondary">
                      {item.proficiencyLevel}%
                    </span>
                    {!item.isPublished && (
                      <span className="ml-2 text-xs text-dracula-orange">
                        (taslak)
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing({ ...item });
                        setSaved(false);
                      }}
                      className="text-secondary hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-error hover:underline"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-on-surface-variant">
            Henüz teknoloji eklenmemiş.
          </p>
        )}
      </section>

      {editing && (
        <div className="mt-6">
          <CmsPanel title={editing.id ? 'Düzenle' : 'Yeni Teknoloji'}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="İsim">
                <input
                  className={inputClass}
                  value={editing.name ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
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
                  placeholder="Backend, Database, Infrastructure..."
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
            <ImageUploader
              label="Teknoloji Görseli / İkon"
              folder="tech-stack"
              imageUrl={editing.imageUrl}
              imageKey={editing.imageKey}
              onChange={({ imageUrl, imageKey }) =>
                setEditing({ ...editing, imageUrl, imageKey })
              }
              onClear={() =>
                setEditing({ ...editing, imageUrl: null, imageKey: null })
              }
            />
            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Yetkinlik (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={editing.proficiencyLevel ?? 80}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      proficiencyLevel: Number(e.target.value),
                    })
                  }
                />
              </FormField>
              <FormField label="Deneyim (yıl)">
                <input
                  type="number"
                  className={inputClass}
                  value={editing.yearsExperience ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      yearsExperience: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
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
                className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-sm"
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
