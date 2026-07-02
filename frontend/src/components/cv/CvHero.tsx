interface CvHeroProps {
  badge: string;
  title: string;
  description?: string;
}

/**
 * CV sayfaları için ortak başlık banner'ı —
 * projects / tech-stack sayfalarıyla tutarlı scanline stili.
 */
export function CvHero({ badge, title, description }: CvHeroProps) {
  return (
    <div className="scanline-container relative mb-10 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 shadow-lg">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
      <span className="pulse-effect relative z-10 mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-secondary">
        <span className="text-primary">◉</span>
        {badge}
      </span>
      <h1 className="hero-glow relative z-10 text-4xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="relative z-10 mt-3 max-w-2xl text-on-surface-variant">{description}</p>
      )}
    </div>
  );
}
