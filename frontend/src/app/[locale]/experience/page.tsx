import { PageShell } from '@/components/layout/PageShell';
import { CvHero } from '@/components/cv/CvHero';
import { fetchContentBundle } from '@/lib/api/client';
import type { AppLocale } from '@/i18n/routing';

/** İş deneyimi zaman çizelgesi */
export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const content = await fetchContentBundle(locale).catch(() => null);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono">
        {locale === 'tr' ? 'Yüklenemedi.' : 'Failed to load.'}
      </div>
    );
  }

  const experiences = content.experiences ?? [];

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <CvHero
        badge={locale === 'tr' ? 'Kariyer Yolu' : 'Career Path'}
        title={locale === 'tr' ? 'İş Deneyimi' : 'Work Experience'}
        description={
          locale === 'tr'
            ? 'Üzerinde çalıştığım sistemler, üstlendiğim roller ve ürettiğim etki.'
            : 'The systems I have built, the roles I have held, and the impact I have delivered.'
        }
      />

      {experiences.length === 0 ? (
        <p className="font-mono text-on-surface-variant">
          {locale === 'tr'
            ? 'Deneyim kaydı henüz eklenmedi.'
            : 'No experience records added yet.'}
        </p>
      ) : (
        <div className="relative ml-3 border-l-2 border-outline-variant pl-8">
          {experiences.map((exp) => (
            <article key={exp.id} className="relative mb-10 last:mb-0">
              <span
                className={`absolute -left-10.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  exp.isCurrent
                    ? 'border-dracula-green bg-dracula-green/20'
                    : 'border-primary-container bg-surface-container'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    exp.isCurrent ? 'pulse-status bg-dracula-green' : 'bg-primary-container'
                  }`}
                />
              </span>

              <div className="glow-hover rounded-xl border border-outline-variant bg-surface-container p-6 transition-all hover:border-primary-container">
                <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-semibold text-on-surface">{exp.role}</h2>
                  <span className="font-mono text-xs uppercase tracking-wider text-secondary">
                    {exp.period}
                  </span>
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-on-surface-variant">
                  <span className="font-bold text-primary">{exp.company}</span>
                  {exp.employmentType && <span>· {exp.employmentType}</span>}
                  {exp.location && <span>· {exp.location}</span>}
                </div>

                {exp.description && (
                  <p className="mb-4 text-on-surface-variant">{exp.description}</p>
                )}

                {exp.highlights.length > 0 && (
                  <ul className="mb-4 space-y-2">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                        <span className="mt-1 text-dracula-green">▹</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-outline-variant/50 bg-background/50 px-2.5 py-1 font-mono text-xs text-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
