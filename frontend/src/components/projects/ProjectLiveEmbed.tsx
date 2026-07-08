'use client';

import { useState } from 'react';

type ProjectLiveEmbedProps = {
  url: string;
  title: string;
  locale: 'tr' | 'en';
};

/**
 * Yayında olan projelerin harici sitesini portfolyo içinde gömülü gösterir.
 * Site X-Frame-Options ile engellenirse harici link sunar.
 */
export function ProjectLiveEmbed({ url, title, locale }: ProjectLiveEmbedProps) {
  const [blocked, setBlocked] = useState(false);

  const openLabel = locale === 'tr' ? 'Yeni sekmede aç →' : 'Open in new tab →';
  const sectionLabel = locale === 'tr' ? 'Canlı Önizleme' : 'Live Preview';
  const blockedMessage =
    locale === 'tr'
      ? 'Bu site güvenlik ayarları nedeniyle burada gömülemez.'
      : 'This site cannot be embedded due to security settings.';

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {sectionLabel}
        </h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-secondary transition-colors hover:text-primary"
        >
          {openLabel}
        </a>
      </div>

      <div className="scanline-container overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container">
        {blocked ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 p-8 text-center md:min-h-120">
            <p className="max-w-md text-on-surface-variant">{blockedMessage}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-hover rounded-lg border border-secondary/40 px-5 py-2.5 font-mono text-sm text-secondary transition-all hover:bg-secondary/10"
            >
              {locale === 'tr' ? 'Siteyi ziyaret et →' : 'Visit site →'}
            </a>
          </div>
        ) : (
          <iframe
            src={url}
            title={title}
            className="h-80 w-full border-0 bg-white md:h-140"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
            onError={() => setBlocked(true)}
          />
        )}
      </div>
    </section>
  );
}
