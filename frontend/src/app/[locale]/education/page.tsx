import { PageShell } from '@/components/layout/PageShell';
import { CvHero } from '@/components/cv/CvHero';
import { fetchContentBundle } from '@/lib/api/client';
import type { AppLocale } from '@/i18n/routing';

/** Eğitim ve sertifikalar */
export default async function EducationPage({
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

  const education = content.education ?? [];
  const certifications = content.certifications ?? [];

  return (
    <PageShell locale={locale} settings={content.siteSettings}>
      <CvHero
        badge={locale === 'tr' ? 'Akademik & Sertifikalar' : 'Academic & Certifications'}
        title={locale === 'tr' ? 'Eğitim' : 'Education'}
        description={
          locale === 'tr'
            ? 'Akademik geçmişim ve sürekli öğrenmeyi kanıtlayan sertifikalarım.'
            : 'My academic background and certifications that reflect continuous learning.'
        }
      />

      <section className="mb-14">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
          <span className="text-primary">◧</span>
          {locale === 'tr' ? 'Eğitim' : 'Education'}
        </h2>
        {education.length === 0 ? (
          <p className="font-mono text-on-surface-variant">
            {locale === 'tr' ? 'Eğitim kaydı yok.' : 'No education records.'}
          </p>
        ) : (
          <div className="space-y-5">
            {education.map((edu) => (
              <article
                key={edu.id}
                className="glow-hover rounded-xl border border-outline-variant bg-surface-container p-6 transition-all hover:border-primary-container"
              >
                <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-on-surface">{edu.degree}</h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-secondary">
                    {edu.period}
                  </span>
                </div>
                <p className="font-mono text-sm text-primary">{edu.institution}</p>
                {edu.field && (
                  <p className="mt-1 font-mono text-xs text-on-surface-variant">{edu.field}</p>
                )}
                {edu.description && (
                  <p className="mt-3 text-sm text-on-surface-variant">{edu.description}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
          <span className="text-tertiary">✦</span>
          {locale === 'tr' ? 'Sertifikalar' : 'Certifications'}
        </h2>
        {certifications.length === 0 ? (
          <p className="font-mono text-on-surface-variant">
            {locale === 'tr' ? 'Sertifika yok.' : 'No certifications.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {certifications.map((cert) => (
              <article
                key={cert.id}
                className="glass-card scanline-container rounded-xl p-6"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-on-surface">{cert.name}</h3>
                  {cert.issueDate && (
                    <span className="shrink-0 font-mono text-xs text-on-surface-variant">
                      {cert.issueDate}
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-secondary">{cert.issuer}</p>
                {cert.description && (
                  <p className="mt-3 text-sm text-on-surface-variant">{cert.description}</p>
                )}
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                  >
                    {locale === 'tr' ? 'Doğrula' : 'Verify'} →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
