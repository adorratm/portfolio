/**
 * Hero bölümü — profil API'sinden gelen verilerle render edilir.
 * badgeText, headline ve terminal (neofetch) satırları admin'den yönetilir.
 */
export interface HeroProps {
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  bio: string;
  terminalLines: Array<{ label: string; value: string; link?: string }>;
}

export function HeroSection({
  badgeText,
  headlinePrefix,
  headlineHighlight,
  bio,
  terminalLines,
}: HeroProps) {
  return (
    <section className="mb-24 flex flex-col items-center text-center">
      <div className="mb-6 inline-block rounded-full border border-primary/20 bg-primary-container/10 px-4 py-1 font-mono text-sm text-primary">
        {badgeText}
      </div>

      <h1 className="hero-glow mb-6 text-4xl font-bold md:text-5xl">
        {headlinePrefix}{' '}
        <span className="text-primary">{headlineHighlight}</span>
      </h1>

      <p className="mb-12 max-w-2xl text-lg text-on-surface-variant">{bio}</p>

      {/* Terminal penceresi — neofetch çıktısı */}
      <div className="glass-card float-animation w-full max-w-3xl overflow-hidden rounded-xl">
        <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5555]" />
            <div className="h-3 w-3 rounded-full bg-[#f1fa8c]" />
            <div className="h-3 w-3 rounded-full bg-[#50fa7b]" />
          </div>
          <div className="mx-auto font-mono text-xs text-on-surface-variant">
            zsh — 80x24
          </div>
        </div>
        <div className="p-6 text-left font-mono text-sm leading-relaxed">
          <div className="mb-2">
            <span className="text-[#50fa7b]">➜</span>{' '}
            <span className="text-[#8be9fd]">~</span> neofetch
          </div>
          <div className="space-y-1">
            {terminalLines.map((line) => (
              <div key={line.label}>
                <span className="font-bold text-primary-container">{line.label}:</span>{' '}
                {line.link ? (
                  <a href={line.link} className="text-[#8be9fd] underline">
                    {line.value}
                  </a>
                ) : (
                  line.value
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
