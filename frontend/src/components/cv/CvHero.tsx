import Image from 'next/image';

interface CvHeroProps {
  badge: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageAlt?: string;
}

/**
 * CV sayfaları için ortak başlık banner'ı —
 * projects / tech-stack sayfalarıyla tutarlı scanline stili.
 */
export function CvHero({
  badge,
  title,
  description,
  imageUrl,
  imageAlt,
}: CvHeroProps) {
  return (
    <div className="scanline-container relative mb-10 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 shadow-lg">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className="pulse-effect mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-secondary">
            <span className="text-primary">◉</span>
            {badge}
          </span>
          <h1 className="hero-glow text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-on-surface-variant">{description}</p>
          )}
        </div>

        {imageUrl && (
          <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-[0_0_30px_rgba(189,147,249,0.25)] sm:mx-0 sm:h-36 sm:w-36">
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              sizes="144px"
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}
