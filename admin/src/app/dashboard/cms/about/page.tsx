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
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { adminApi } from '@/lib/api/client';
import type {
  AboutContent,
  AboutHighlight,
  ExpertiseArea,
  SkillGroup,
} from '@/lib/api/types';
import { useLocaleContent } from '@/providers/LocaleProvider';

type AboutForm = Omit<AboutContent, 'locale'>;

const emptyAbout = (): AboutForm => ({
  headline: '',
  subtitle: '',
  summary: '',
  expertiseAreas: [],
  skillGroups: [],
  highlights: [],
  resumeUrl: '',
  resumeLabel: '',
  imageKey: null,
  imageUrl: null,
  isPublished: true,
});

export default function AboutCmsPage() {
  useRequireAuth();
  const { locale, refreshBundle } = useLocaleContent();
  const [form, setForm] = useState<AboutForm>(emptyAbout());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await adminApi.getAboutAll();
    const row = rows.find((r) => r.locale === locale);
    if (row) {
      setForm({
        headline: row.headline,
        subtitle: row.subtitle ?? '',
        summary: row.summary,
        expertiseAreas: row.expertiseAreas ?? [],
        skillGroups: row.skillGroups ?? [],
        highlights: row.highlights ?? [],
        resumeUrl: row.resumeUrl ?? '',
        resumeLabel: row.resumeLabel ?? '',
        imageKey: row.imageKey ?? null,
        imageUrl: row.imageUrl ?? null,
        isPublished: row.isPublished ?? true,
      });
    } else {
      setForm(emptyAbout());
    }
  }, [locale]);

  useEffect(() => {
    load().catch(() => setError('Hakkımda içeriği yüklenemedi.'));
  }, [load]);

  const patch = (data: Partial<AboutForm>) => {
    setForm((prev) => ({ ...prev, ...data }));
    setSaved(false);
  };

  // ——— Expertise areas ———
  const updateArea = (i: number, field: keyof ExpertiseArea, value: string) => {
    setForm((prev) => {
      const areas = [...prev.expertiseAreas];
      areas[i] = { ...areas[i], [field]: value };
      return { ...prev, expertiseAreas: areas };
    });
    setSaved(false);
  };

  // ——— Skill groups ———
  const updateGroup = (i: number, field: 'category' | 'skills', value: string) => {
    setForm((prev) => {
      const groups = [...prev.skillGroups];
      groups[i] = {
        ...groups[i],
        [field]:
          field === 'skills'
            ? value.split(',').map((s) => s.trim()).filter(Boolean)
            : value,
      };
      return { ...prev, skillGroups: groups };
    });
    setSaved(false);
  };

  // ——— Highlights ———
  const updateHighlight = (i: number, field: keyof AboutHighlight, value: string) => {
    setForm((prev) => {
      const list = [...prev.highlights];
      list[i] = { ...list[i], [field]: value };
      return { ...prev, highlights: list };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.upsertAbout({
        locale,
        headline: form.headline,
        subtitle: form.subtitle || null,
        summary: form.summary,
        expertiseAreas: form.expertiseAreas,
        skillGroups: form.skillGroups,
        highlights: form.highlights,
        resumeUrl: form.resumeUrl || null,
        resumeLabel: form.resumeLabel || null,
        imageKey: form.imageKey,
        imageUrl: form.imageUrl,
        isPublished: form.isPublished ?? true,
      });
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
      title="Hakkımda"
      subtitle="/about sayfası: özet, uzmanlık alanları, yetenekler ve özgeçmiş bağlantısı"
    >
      <CmsPanel title="Özet">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Başlık">
            <input
              className={inputClass}
              value={form.headline}
              onChange={(e) => patch({ headline: e.target.value })}
            />
          </FormField>
          <FormField label="Alt Başlık / Ünvan">
            <input
              className={inputClass}
              value={form.subtitle ?? ''}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Profesyonel Özet">
          <textarea
            className={`${textareaClass} min-h-40`}
            value={form.summary}
            onChange={(e) => patch({ summary: e.target.value })}
          />
        </FormField>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Özgeçmiş (PDF) URL" hint="Boş bırakılırsa indirme butonu gizlenir">
            <input
              className={inputClass}
              placeholder="https://.../cv.pdf"
              value={form.resumeUrl ?? ''}
              onChange={(e) => patch({ resumeUrl: e.target.value })}
            />
          </FormField>
          <FormField label="Özgeçmiş Buton Metni">
            <input
              className={inputClass}
              value={form.resumeLabel ?? ''}
              onChange={(e) => patch({ resumeLabel: e.target.value })}
            />
          </FormField>
        </div>
        <label className="flex items-center gap-2 font-mono text-sm">
          <input
            type="checkbox"
            checked={form.isPublished ?? true}
            onChange={(e) => patch({ isPublished: e.target.checked })}
          />
          Yayında
        </label>
      </CmsPanel>

      <div className="mt-6">
        <CmsPanel title="Öne Çıkan Metrikler">
          {form.highlights.map((h, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-outline-variant/30 bg-surface-container p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                className={inputClass}
                placeholder="Değer (ör. 8+)"
                value={h.value}
                onChange={(e) => updateHighlight(i, 'value', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Etiket (ör. Yıl Deneyim)"
                value={h.label}
                onChange={(e) => updateHighlight(i, 'label', e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  patch({ highlights: form.highlights.filter((_, x) => x !== i) })
                }
                className="font-mono text-xs text-error hover:underline"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({ highlights: [...form.highlights, { label: '', value: '' }] })
            }
            className="rounded-lg border border-dashed border-outline-variant px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-variant"
          >
            + Metrik Ekle
          </button>
        </CmsPanel>
      </div>

      <div className="mt-6">
        <CmsPanel title="Uzmanlık Alanları">
          {form.expertiseAreas.map((area, i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-outline-variant/30 bg-surface-container p-4"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_5rem_auto]">
                <input
                  className={inputClass}
                  placeholder="Başlık"
                  value={area.title}
                  onChange={(e) => updateArea(i, 'title', e.target.value)}
                />
                <input
                  className={inputClass}
                  placeholder="İkon"
                  value={area.icon ?? ''}
                  onChange={(e) => updateArea(i, 'icon', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      expertiseAreas: form.expertiseAreas.filter((_, x) => x !== i),
                    })
                  }
                  className="font-mono text-xs text-error hover:underline"
                >
                  Sil
                </button>
              </div>
              <textarea
                className={textareaClass}
                placeholder="Açıklama"
                value={area.description}
                onChange={(e) => updateArea(i, 'description', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                expertiseAreas: [
                  ...form.expertiseAreas,
                  { title: '', description: '', icon: '' },
                ],
              })
            }
            className="rounded-lg border border-dashed border-outline-variant px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-variant"
          >
            + Alan Ekle
          </button>
        </CmsPanel>
      </div>

      <div className="mt-6">
        <CmsPanel title="Yetenekler (kategorize)">
          {form.skillGroups.map((group, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-outline-variant/30 bg-surface-container p-4 md:grid-cols-[1fr_2fr_auto]"
            >
              <input
                className={inputClass}
                placeholder="Kategori"
                value={group.category}
                onChange={(e) => updateGroup(i, 'category', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Yetenekler (virgülle ayır)"
                value={(group.skills ?? []).join(', ')}
                onChange={(e) => updateGroup(i, 'skills', e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  patch({ skillGroups: form.skillGroups.filter((_, x) => x !== i) })
                }
                className="font-mono text-xs text-error hover:underline"
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                skillGroups: [...form.skillGroups, { category: '', skills: [] }],
              })
            }
            className="rounded-lg border border-dashed border-outline-variant px-4 py-2 font-mono text-sm text-secondary hover:bg-surface-variant"
          >
            + Kategori Ekle
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
