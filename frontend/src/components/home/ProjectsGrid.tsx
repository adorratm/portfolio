import Image from 'next/image';

export interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  technologies: string[];
  externalUrl?: string | null;
}

interface ProjectsGridProps {
  projects: ProjectCardData[];
  title: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}

/**
 * Proje kartları grid'i — "Canlı Sistemler" bölümü.
 * Görseller S3'ten gelir; admin panelinden yönetilir.
 */
export function ProjectsGrid({
  projects,
  title,
  viewAllLabel,
  viewAllHref,
}: ProjectsGridProps) {
  return (
    <section className="mb-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-semibold">{title}</h2>
          <div className="h-1 w-20 bg-tertiary" />
        </div>
        {viewAllLabel && viewAllHref && (
          <a
            href={viewAllHref}
            className="flex items-center gap-2 font-mono text-sm text-tertiary transition-transform hover:translate-x-1"
          >
            {viewAllLabel} →
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            className="glass-card group cursor-pointer overflow-hidden rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,121,198,0.2)]"
          >
            {project.imageUrl && (
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
                <span className="absolute bottom-4 left-6 rounded-full border border-tertiary/30 bg-tertiary/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary">
                  {project.category}
                </span>
              </div>
            )}
            <div className="p-8">
              <h3 className="mb-4 text-2xl font-semibold group-hover:text-tertiary">
                {project.title}
              </h3>
              <p className="mb-6 text-on-surface-variant">{project.description}</p>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-outline-variant bg-surface-container px-2 py-1 font-mono text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
