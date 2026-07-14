import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { ProjectLiveEmbed } from '@/components/projects/ProjectLiveEmbed';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { localizedHref } from '@/i18n/paths';
import type { AppLocale } from '@/i18n/routing';
import { fetchContentBundle, fetchProjectById } from '@/lib/api/client';
import { buildBreadcrumbJsonLd, buildProjectJsonLd } from '@/lib/json-ld';
import { resolveProjectImageUrl } from '@/lib/media';
import {
  buildAlternates,
  buildOpenGraph,
  buildTwitterCard,
  getSiteUrl,
  seoPath,
  truncateMetaDescription,
} from '@/lib/seo';
import { contentPathId, isUuid } from '@/lib/slug';
import { permanentRedirect } from 'next/navigation';

const statusStyles: Record<string, string> = {
  active: 'text-dracula-green border-dracula-green/30 bg-dracula-green/10',
  staging: 'text-dracula-orange border-dracula-orange/30 bg-dracula-orange/10',
  archived: 'text-on-surface-variant border-outline-variant bg-surface-container',
};

function projectHref(slugOrId: string) {
  return {
    pathname: '/projects/[id]' as const,
    params: { id: slugOrId },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const [content, project] = await Promise.all([
    fetchContentBundle(locale).catch(() => null),
    fetchProjectById(locale, id).catch(() => null),
  ]);

  if (!project) return {};

  const siteTitle = content?.siteSettings?.siteTitle ?? 'Emre Kılıç | Portfolio';
  const imageUrl = resolveProjectImageUrl(project);
  const title = `${project.title} | ${siteTitle}`;
  const description = truncateMetaDescription(project.description);
  const href = projectHref(contentPathId(project));

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: buildAlternates(locale, href),
    openGraph: buildOpenGraph(locale, title, description, href, imageUrl),
    twitter: buildTwitterCard(title, description, imageUrl),
    robots: { index: true, follow: true },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; id: string }>;
}) {
  const { locale, id } = await params;
  const [content, project] = await Promise.all([
    fetchContentBundle(locale).catch(() => null),
    fetchProjectById(locale, id).catch(() => null),
  ]);

  if (!content || !project) notFound();

  const slug = contentPathId(project);
  if (isUuid(id) && project.slug && project.slug !== id) {
    permanentRedirect(localizedHref(locale, projectHref(project.slug)));
  }

  const backLabel = locale === 'tr' ? '← Tüm Projeler' : '← All Projects';
  const heroImage = resolveProjectImageUrl(project);
  const projectsLabel = locale === 'tr' ? 'Projeler' : 'Projects';

  return (
    <PageShell locale={locale} settings={content.siteSettings} profile={content.profile}>
      <JsonLd
        data={[
          buildProjectJsonLd(locale, {
            ...project,
            slug,
            imageUrl: heroImage,
          }),
          buildBreadcrumbJsonLd(locale, [
            { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', path: '' },
            { name: projectsLabel, path: seoPath(locale, '/projects') },
            {
              name: project.title,
              path: seoPath(locale, projectHref(slug)),
            },
          ]),
        ]}
      />

      <Link
        href="/projects"
        className="mb-8 inline-flex font-mono text-sm text-secondary transition-colors hover:text-primary"
      >
        {backLabel}
      </Link>

      <article className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        {heroImage && (
          <div className="group relative h-72 overflow-hidden md:h-96">
            <Image
              src={heroImage}
              alt={project.title}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
            <span className="pulse-animation absolute bottom-6 left-6 rounded-full border border-tertiary/30 bg-tertiary/20 px-4 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary backdrop-blur-sm">
              {project.category}
            </span>
          </div>
        )}

        <div className="p-8 md:p-12">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-3">
              {project.status && (
                <span
                  className={`rounded border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${statusStyles[project.status] ?? statusStyles.archived}`}
                >
                  {project.status}
                </span>
              )}
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-hover rounded-lg border border-secondary/40 px-4 py-2 font-mono text-sm text-secondary transition-all hover:bg-secondary/10 active:scale-95"
                >
                  {locale === 'tr' ? 'Canlı Sistem →' : 'Live System →'}
                </a>
              )}
            </div>
          </div>

          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
            {project.description}
          </p>

          {project.endpoint && (
            <div className="mb-8 rounded-lg border border-outline-variant/30 bg-surface-container p-4">
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Endpoint
              </span>
              <code className="font-mono text-sm text-secondary">{project.endpoint}</code>
            </div>
          )}

          <div>
            <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {locale === 'tr' ? 'Teknoloji Yığını' : 'Tech Stack'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="tech-badge rounded border border-outline-variant bg-surface-container px-3 py-1.5 font-mono text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.externalUrl && (
            <ProjectLiveEmbed
              url={project.externalUrl}
              title={project.title}
              locale={locale}
            />
          )}
        </div>
      </article>
    </PageShell>
  );
}
