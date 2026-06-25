import Image from 'next/image';
import Link from 'next/link';

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
  locale: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}

const floatClasses = ['float-animation', 'float-delayed'] as const;

/**
 * Proje kartları — hover glow, float, pulse badge.
 */
export function ProjectsGrid({
  projects,
  title,
  locale,
  viewAllLabel,
  viewAllHref,
}: ProjectsGridProps) {
  return (
    <section className="mb-24">
      {title && (
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-semibold">{title}</h2>
            <div className="h-1 w-20 bg-tertiary" />
          </div>
          {viewAllLabel && viewAllHref && (
            <Link
              href={viewAllHref}
              className="hover-bounce flex items-center gap-2 font-mono text-sm text-tertiary transition-transform hover:translate-x-1 active:scale-95"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={`/${locale}/projects/${project.id}`}
            className={`glass-card group block cursor-pointer overflow-hidden rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,121,198,0.2)] active:scale-[0.99] ${floatClasses[index % 2]}`}
          >
            {project.imageUrl ? (
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
                <span className="pulse-animation absolute bottom-4 left-6 rounded-full border border-tertiary/30 bg-tertiary/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary backdrop-blur-sm">
                  {project.category}
                </span>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center bg-surface-container">
                <span className="pulse-animation rounded-full border border-tertiary/30 bg-tertiary/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-tertiary">
                  {project.category}
                </span>
              </div>
            )}
            <div className="p-8">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-2xl font-semibold transition-colors group-hover:text-tertiary">
                  {project.title}
                </h3>
                <span className="text-on-surface-variant transition-all group-hover:translate-x-1 group-hover:text-tertiary">
                  ↗
                </span>
              </div>
              <p className="mb-6 line-clamp-3 text-on-surface-variant">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="tech-badge rounded border border-outline-variant bg-surface-container px-2 py-1 font-mono text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
