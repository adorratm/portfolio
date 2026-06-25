'use client';

import type { ContentBundle } from '@/lib/api/types';

/**
 * Seçili locale'in CMS içeriği önizlemesi — tamamı backend bundle'dan.
 */
export function ContentPreview({ bundle }: { bundle: ContentBundle }) {
  const { profile, siteSettings, projects, locale } = bundle;

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
      <h3 className="mb-4 font-mono text-sm font-bold uppercase text-primary">
        CMS Önizleme — {locale.toUpperCase()}
      </h3>

      {profile && (
        <div className="mb-6 border-b border-outline-variant/20 pb-6">
          <h4 className="mb-2 font-semibold">Hero</h4>
          <p className="text-sm text-on-surface-variant">
            {profile.headlinePrefix}{' '}
            <span className="text-primary">{profile.headlineHighlight}</span>
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">{profile.bio}</p>
        </div>
      )}

      {siteSettings && (
        <div className="mb-6 border-b border-outline-variant/20 pb-6">
          <h4 className="mb-2 font-semibold">{siteSettings.brandName}</h4>
          <p className="text-sm text-on-surface-variant">
            {siteSettings.philosophyTitle}: {siteSettings.philosophyBody}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold">
            {siteSettings?.projectsSectionTitle ?? 'Projects'} ({projects.length})
          </h4>
          <ul className="space-y-2 font-mono text-sm text-on-surface-variant">
            {projects.map((p) => (
              <li key={p.id}>
                • {p.title} — <span className="text-tertiary">{p.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
