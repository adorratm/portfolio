'use client';

import { inputClass } from './CmsForm';

export type NavItem = { label: string; href: string; icon?: string };

interface NavItemsEditorProps {
  value: NavItem[];
  onChange: (items: NavItem[]) => void;
}

export function NavItemsEditor({ value, onChange }: NavItemsEditorProps) {
  const items = value ?? [];

  const update = (index: number, patch: Partial<NavItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([...items, { label: '', href: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-outline-variant/60 px-4 py-6 text-center text-sm text-on-surface-variant/70">
          Henüz navigasyon öğesi yok. Aşağıdan ekleyin.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-outline-variant/40 bg-surface-container p-3"
        >
          <div className="flex items-center justify-end gap-1">
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
              disabled={index === items.length - 1}
              className="rounded-md border border-outline-variant px-2 py-1.5 text-xs text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-30"
              title="Aşağı taşı"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-md border border-error/40 px-2 py-1.5 text-xs text-error transition-colors hover:bg-error/10"
              title="Sil"
            >
              Sil
            </button>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              className={inputClass}
              value={item.label}
              placeholder="Etiket (ör. Ana Sayfa)"
              onChange={(e) => update(index, { label: e.target.value })}
            />
            <input
              className={inputClass}
              value={item.href}
              placeholder="URL (ör. /tr/about)"
              onChange={(e) => update(index, { href: e.target.value })}
            />
          </div>
          <input
            className={`${inputClass} mt-2`}
            value={item.icon ?? ''}
            placeholder="İkon (isteğe bağlı)"
            onChange={(e) => update(index, { icon: e.target.value || undefined })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-lg border border-dashed border-primary/50 px-4 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-primary/10"
      >
        + Navigasyon Öğesi Ekle
      </button>
    </div>
  );
}
