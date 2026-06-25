'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { adminApi } from '@/lib/api/client';

interface ImageUploaderProps {
  label: string;
  folder: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  onChange: (data: { imageUrl: string; imageKey: string }) => void;
  onClear?: () => void;
}

/**
 * Görsel yükleme — backend /media/upload (S3 veya yerel disk).
 */
export function ImageUploader({
  label,
  folder,
  imageUrl,
  imageKey,
  onChange,
  onClear,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Yalnızca görsel dosyaları yüklenebilir.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Maksimum dosya boyutu 10MB.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const result = await adminApi.uploadMedia(file, folder);
      onChange({ imageUrl: result.publicUrl, imageKey: result.key });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <span className="block font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
          <div className="relative h-40 w-full">
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-outline-variant/30 px-3 py-2">
            <span className="truncate font-mono text-[10px] text-on-surface-variant">
              {imageKey ?? imageUrl}
            </span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-mono text-xs text-secondary hover:underline"
              >
                Değiştir
              </button>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="font-mono text-xs text-error hover:underline"
                >
                  Kaldır
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface-container px-4 py-8 transition-colors hover:border-primary hover:bg-surface-variant disabled:opacity-50"
        >
          <span className="text-2xl text-primary">↑</span>
          <span className="font-mono text-sm text-on-surface-variant">
            {uploading ? 'Yükleniyor...' : 'Görsel seç veya sürükle'}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant/60">
            PNG, JPG, WebP — max 10MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="font-mono text-xs text-error">{error}</p>}
    </div>
  );
}
