'use client';

import { inputClass } from './CmsForm';
import { SOCIAL_PRESETS, SocialIcon, type SocialLink } from '@/lib/social-icons';

interface SocialLinksEditorProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const links = value ?? [];

  const update = (index: number, patch: Partial<SocialLink>) => {
    onChange(links.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  };

  const addLink = () => {
    onChange([...links, { type: '', url: '', icon: 'link' }]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="rounded-lg border border-dashed border-outline-variant/60 px-4 py-6 text-center text-sm text-on-surface-variant/70">
          Henüz sosyal link yok. Aşağıdan ekleyin.
        </p>
      )}

      {links.map((link, index) => (
        <div
          key={index}
          className="rounded-lg border border-outline-variant/40 bg-surface-container p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant"
              aria-hidden
            >
              <SocialIcon link={link} className="text-base" />
            </span>

            <select
              className={`${inputClass} max-w-48`}
              value={SOCIAL_PRESETS.some((p) => p.name === link.type) ? link.type : ''}
              onChange={(e) => {
                const preset = SOCIAL_PRESETS.find((p) => p.name === e.target.value);
                if (preset) update(index, { type: preset.name, icon: preset.icon });
              }}
            >
              <option value="">Platform seç…</option>
              {SOCIAL_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

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
                disabled={index === links.length - 1}
                className="rounded-md border border-outline-variant px-2 py-1.5 text-xs text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-30"
                title="Aşağı taşı"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="rounded-md border border-error/40 px-2 py-1.5 text-xs text-error transition-colors hover:bg-error/10"
                title="Sil"
              >
                Sil
              </button>
            </div>
          </div>

          <div className="mt-2">
            <input
              className={inputClass}
              value={link.type}
              placeholder="Ad (ör. GitHub)"
              onChange={(e) => update(index, { type: e.target.value })}
            />
          </div>
          <input
            className={`${inputClass} mt-2`}
            value={link.url}
            placeholder="https://…"
            onChange={(e) => update(index, { url: e.target.value })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="w-full rounded-lg border border-dashed border-primary/50 px-4 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-primary/10"
      >
        + Sosyal Link Ekle
      </button>
    </div>
  );
}
