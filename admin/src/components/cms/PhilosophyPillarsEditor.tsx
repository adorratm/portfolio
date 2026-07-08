'use client';

import { inputClass } from './CmsForm';

export type PhilosophyPillar = { label: string; color: string };

const PILLAR_COLORS = [
  { value: 'green', label: 'Yeşil', dotClass: 'bg-dracula-green' },
  { value: 'cyan', label: 'Cyan', dotClass: 'bg-secondary' },
  { value: 'purple', label: 'Mor', dotClass: 'bg-primary-container' },
] as const;

interface PhilosophyPillarsEditorProps {
  value: PhilosophyPillar[];
  onChange: (pillars: PhilosophyPillar[]) => void;
}

export function PhilosophyPillarsEditor({ value, onChange }: PhilosophyPillarsEditorProps) {
  const pillars = value ?? [];

  const update = (index: number, patch: Partial<PhilosophyPillar>) => {
    onChange(pillars.map((pillar, i) => (i === index ? { ...pillar, ...patch } : pillar)));
  };

  const addPillar = () => {
    onChange([...pillars, { label: '', color: 'green' }]);
  };

  const removePillar = (index: number) => {
    onChange(pillars.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= pillars.length) return;
    const next = [...pillars];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const colorMeta = (color: string) =>
    PILLAR_COLORS.find((c) => c.value === color) ?? PILLAR_COLORS[0];

  return (
    <div className="space-y-3">
      {pillars.length === 0 && (
        <p className="rounded-lg border border-dashed border-outline-variant/60 px-4 py-6 text-center text-sm text-on-surface-variant/70">
          Henüz sütun yok. Aşağıdan ekleyin.
        </p>
      )}

      {pillars.map((pillar, index) => (
        <div
          key={index}
          className="rounded-lg border border-outline-variant/40 bg-surface-container p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 shrink-0 animate-pulse rounded-full ${colorMeta(pillar.color).dotClass}`}
              aria-hidden
            />

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-md border border-outline-variant px-2 py-1.5 text-xs text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-30"
                title="Yukarı taşı"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === pillars.length - 1}
                className="rounded-md border border-outline-variant px-2 py-1.5 text-xs text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-30"
                title="Aşağı taşı"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removePillar(index)}
                className="rounded-md border border-error/40 px-2 py-1.5 text-xs text-error transition-colors hover:bg-error/10"
                title="Sil"
              >
                Sil
              </button>
            </div>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              className={inputClass}
              value={pillar.label}
              placeholder="Etiket (ör. Önce Ölçeklenebilirlik)"
              onChange={(e) => update(index, { label: e.target.value })}
            />
            <select
              className={inputClass}
              value={PILLAR_COLORS.some((c) => c.value === pillar.color) ? pillar.color : 'green'}
              onChange={(e) => update(index, { color: e.target.value })}
            >
              {PILLAR_COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPillar}
        className="w-full rounded-lg border border-dashed border-primary/50 px-4 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-primary/10"
      >
        + Sütun Ekle
      </button>
    </div>
  );
}
