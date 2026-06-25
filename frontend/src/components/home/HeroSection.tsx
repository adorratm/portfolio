import Image from 'next/image';

export interface HeroProps {
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  bio: string;
  imageUrl?: string | null;
  terminalLines: Array<{ label: string; value: string; link?: string }>;
}

const ASCII_ART = `   .-.
  oo|
 /' '
(\\_;/)`;

/**
 * Hero — float, pulse, terminal cursor; design ile uyumlu.
 */
export function HeroSection({
  badgeText,
  headlinePrefix,
  headlineHighlight,
  bio,
  imageUrl,
  terminalLines,
}: HeroProps) {
  return (
    <section className="relative mb-24 flex flex-col items-center text-center">
      {imageUrl && (
        <div className="pulse-animation relative mb-8 h-28 w-28 overflow-hidden rounded-full border-2 border-primary shadow-[0_0_20px_rgba(189,147,249,0.4)]">
          <Image
            src={imageUrl}
            alt={headlinePrefix}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="pulse-animation mb-6 inline-block rounded-full border border-primary/20 bg-primary-container/10 px-4 py-1 font-mono text-sm text-primary">
        {badgeText}
      </div>

      <h1 className="hero-glow mb-6 text-4xl font-bold tracking-tight md:text-5xl">
        {headlinePrefix}{' '}
        <span className="text-primary">{headlineHighlight}</span>
      </h1>

      <p className="mb-12 max-w-2xl text-lg text-on-surface-variant">{bio}</p>

      <div className="glass-card terminal-shadow float-animation w-full max-w-3xl overflow-hidden rounded-xl">
        <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5555]" />
            <div className="h-3 w-3 rounded-full bg-[#f1fa8c]" />
            <div className="h-3 w-3 rounded-full bg-dracula-green" />
          </div>
          <div className="mx-auto font-mono text-xs text-on-surface-variant">
            zsh — 80x24
          </div>
        </div>
        <div className="p-6 text-left font-mono text-sm leading-relaxed">
          <div className="mb-2">
            <span className="green-accent">➜</span>{' '}
            <span className="cyan-accent">~</span> neofetch
          </div>
          <div className="flex gap-6 sm:gap-8">
            <pre className="purple-accent hidden whitespace-pre text-primary sm:block">
              {ASCII_ART}
            </pre>
            {imageUrl && (
              <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-outline-variant sm:block">
                <Image src={imageUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="space-y-1">
              {terminalLines.map((line) => (
                <div key={line.label}>
                  <span className="purple-accent font-bold">{line.label}:</span>{' '}
                  {line.link ? (
                    <a href={line.link} className="cyan-accent underline">
                      {line.value}
                    </a>
                  ) : (
                    line.value
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <span className="green-accent">➜</span>{' '}
            <span className="cyan-accent">~</span>{' '}
            <span className="cursor-blink inline-block h-4 w-2 bg-primary align-middle" />
          </div>
        </div>
      </div>
    </section>
  );
}
