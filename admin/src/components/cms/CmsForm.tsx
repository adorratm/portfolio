'use client';

import { AdminShell } from '@/components/layout/AdminShell';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useLocaleContent } from '@/providers/LocaleProvider';

interface CmsPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function CmsPageLayout({ title, subtitle, children }: CmsPageLayoutProps) {
  const { t } = useLocaleContent();

  return (
    <AdminShell>
      <main className="mx-auto max-w-360 px-6 py-24 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
            <p className="text-on-surface-variant">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-on-surface-variant">
              {t('locale.switch', 'Dil')}:
            </span>
            <LocaleSwitcher />
          </div>
        </div>
        {children}
      </main>
    </AdminShell>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-on-surface-variant/70">{hint}</span>
      )}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-2.5 font-mono text-sm text-on-surface outline-none transition-colors focus:border-primary focus:shadow-[0_0_10px_rgba(189,147,249,0.2)]';

export const textareaClass = `${inputClass} min-h-24 resize-y`;

export function CmsPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
      <h2 className="mb-6 font-mono text-sm font-bold uppercase tracking-wider text-primary">
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

interface SaveBarProps {
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
  onCancel?: () => void;
}

export function SaveBar({ saving, saved, error, onSave, onCancel }: SaveBarProps) {
  return (
    <div className="sticky bottom-6 z-30 mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-high/95 p-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-primary-container px-6 py-2.5 font-mono text-sm font-bold text-on-primary-container transition-all hover:shadow-[0_0_15px_rgba(189,147,249,0.4)] active:scale-95 disabled:opacity-50"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-outline-variant px-4 py-2.5 font-mono text-sm text-on-surface-variant hover:bg-surface-variant"
        >
          Sıfırla
        </button>
      )}
      {saved && (
        <span className="font-mono text-sm text-dracula-green">✓ Kaydedildi</span>
      )}
      {error && <span className="font-mono text-sm text-error">{error}</span>}
    </div>
  );
}
