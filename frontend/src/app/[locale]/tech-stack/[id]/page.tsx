import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { fetchContentBundle, fetchTechStackById } from '@/lib/api/client';
import type { AppLocale } from '@/i18n/routing';

export default async function TechStackDetailPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}) {
  const { locale, id } = await params;
  const [content, item] = await Promise.all([
    fetchContentBundle(locale).catch(() => null),
    fetchTechStackById(locale, id).catch(() => null),
  ]);

  if (!content || !item) notFound();

  const backLabel = locale === 'tr' ? '← Tech Stack' : '← Tech Stack';

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <Link
        href={`/${locale}/tech-stack`}
        className="hover-bounce mb-8 inline-flex font-mono text-sm text-secondary transition-colors hover:text-primary active:scale-95"
      >
        {backLabel}
      </Link>

      <article className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 md:p-12">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-start">
          {item.imageUrl && (
            <div className="pulse-animation relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-primary bg-surface-container shadow-[0_0_15px_rgba(189,147,249,0.3)]">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <span className="pulse-effect mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-secondary">
              {item.category}
            </span>
            <h1 className="hero-glow mb-4 text-4xl font-bold">{item.name}</h1>

            {item.description && (
              <p className="mb-8 max-w-2xl text-lg text-on-surface-variant">
                {item.description}
              </p>
            )}

            <div className="mb-6 max-w-xl">
              <div className="mb-2 flex justify-between font-mono text-sm">
                <span>{locale === 'tr' ? 'Yetkinlik' : 'Proficiency'}</span>
                <span className="text-secondary">{item.proficiencyLevel}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="bar-fill-animate h-full bg-secondary glow-cyan"
                  style={{ width: `${item.proficiencyLevel}%` }}
                />
              </div>
            </div>

            {item.yearsExperience != null && (
              <div className="tech-badge float-animation inline-block rounded-lg border border-outline-variant/30 bg-surface-container px-6 py-4">
                <span className="block text-3xl font-bold text-primary">
                  {item.yearsExperience}+
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {locale === 'tr' ? 'Yıl Deneyim' : 'Years Experience'}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
