'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Sil',
  cancelLabel = 'İptal',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onCancel}
        disabled={loading}
      />
      <div className="scanline-effect relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-high shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="border-b border-outline-variant/30 px-6 py-4">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-dracula-pink">
            Onay Gerekli
          </p>
          <h2
            id="confirm-dialog-title"
            className="mt-1 font-mono text-lg font-bold text-on-surface"
          >
            {title}
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="font-mono text-sm leading-relaxed text-on-surface-variant">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-outline-variant/30 bg-surface-container/50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-outline-variant px-4 py-2 font-mono text-sm text-on-surface-variant transition-colors hover:bg-surface-variant disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-dracula-pink px-4 py-2 font-mono text-sm font-bold text-background transition-all hover:shadow-[0_0_15px_rgba(255,121,198,0.35)] disabled:opacity-50"
          >
            {loading ? 'Siliniyor...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
