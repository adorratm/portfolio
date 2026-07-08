'use client';

import { useState } from 'react';

type ExternalUrlPreviewProps = {
  url: string;
  title?: string;
  height?: number;
};

/**
 * Harici proje sitesini iframe ile önizler.
 * X-Frame-Options engellenirse kullanıcıya yeni sekme linki gösterilir.
 */
export function ExternalUrlPreview({
  url,
  title = 'Site önizlemesi',
  height = 420,
}: ExternalUrlPreviewProps) {
  const [blocked, setBlocked] = useState(false);

  if (!url.trim()) return null;

  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          Site Önizlemesi
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-secondary hover:underline"
        >
          Yeni sekmede aç ↗
        </a>
      </div>

      {blocked ? (
        <div
          className="flex flex-col items-center justify-center gap-3 p-8 text-center"
          style={{ height }}
        >
          <p className="font-mono text-sm text-on-surface-variant">
            Bu site güvenlik ayarları nedeniyle iframe içinde açılamıyor.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-secondary/40 px-4 py-2 font-mono text-sm text-secondary hover:bg-secondary/10"
          >
            Siteyi yeni sekmede aç →
          </a>
        </div>
      ) : (
        <iframe
          src={url}
          title={title}
          className="w-full border-0 bg-white"
          style={{ height }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          onError={() => setBlocked(true)}
        />
      )}
    </div>
  );
}
