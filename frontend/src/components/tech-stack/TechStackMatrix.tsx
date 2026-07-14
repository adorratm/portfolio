import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import type { SiteSettings, TechStackItem } from '@/lib/api/types';
import { contentPathId } from '@/lib/slug';

interface TechStackMatrixProps {
  items: TechStackItem[];
  settings: SiteSettings | null;
  locale: AppLocale | string;
}

const CATEGORY_ORDER = [
  'Backend',
  'Database',
  'Cache',
  'Infrastructure',
  'DevOps',
  'Frontend',
];

function groupByCategory(items: TechStackItem[]): Record<string, TechStackItem[]> {
  return items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

function sortCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function TechIcon({
  item,
  size = 'sm',
}: {
  item: TechStackItem;
  size?: 'sm' | 'md';
}) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  const imageSizes = size === 'sm' ? '36px' : '48px';

  if (item.imageUrl) {
    return (
      <span
        className={`relative inline-flex shrink-0 ${box} items-center justify-center overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-highest`}
      >
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes={imageSizes}
          className="object-contain p-1.5"
        />
      </span>
    );
  }

  if (item.iconName) {
    return (
      <span
        className={`inline-flex shrink-0 ${box} items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-highest font-mono text-base`}
      >
        {item.iconName}
      </span>
    );
  }

  return null;
}

function ProgressBar({
  item,
  locale,
  accent = 'secondary',
  showDescription = false,
}: {
  item: TechStackItem;
  locale: string;
  accent?: 'secondary' | 'green';
  showDescription?: boolean;
}) {
  const barClass =
    accent === 'green'
      ? 'bg-dracula-green glow-green bar-fill-animate'
      : 'bg-secondary glow-cyan bar-fill-animate';
  const textClass = accent === 'green' ? 'text-dracula-green' : 'text-secondary';
  const yearsLabel =
    item.yearsExperience != null
      ? locale === 'tr'
        ? `${item.yearsExperience}+ yıl`
        : `${item.yearsExperience}+ yrs`
      : null;

  return (
    <Link
      href={{
        pathname: '/tech-stack/[id]',
        params: { id: contentPathId(item) },
      }}
      className="group block space-y-2 rounded-lg p-2 transition-all hover:bg-surface-container-highest/50 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 font-mono text-sm">
        <span className="flex min-w-0 flex-1 items-center gap-2.5 text-on-background transition-colors group-hover:text-primary">
          <TechIcon item={item} />
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.name}</span>
            {yearsLabel && (
              <span className="mt-0.5 block text-[11px] text-on-surface-variant">
                {yearsLabel}
              </span>
            )}
          </span>
        </span>
        <span className={`shrink-0 pt-0.5 font-semibold ${textClass}`}>
          {item.proficiencyLevel}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className={`h-full transition-all duration-1000 ease-out ${barClass}`}
          style={{ width: `${item.proficiencyLevel}%` }}
        />
      </div>
      {showDescription && item.description && (
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {item.description}
        </p>
      )}
    </Link>
  );
}

/**
 * Tech stack bento matris — scanline-container, glow barlar.
 */
export function TechStackMatrix({ items, settings, locale }: TechStackMatrixProps) {
  const grouped = groupByCategory(items);
  const categories = sortCategories(Object.keys(grouped));
  const primary = categories[0];
  const secondary = categories.slice(1);

  const heroBadge = locale === 'tr' ? 'Sistem Yetenekleri' : 'System Capabilities';
  const heroTitle =
    locale === 'tr' ? 'Temel Teknoloji Matrisi' : 'Core Technology Matrix';
  const heroBody =
    locale === 'tr'
      ? 'Backend mimarisi, bulut altyapısı ve performans optimizasyonu katmanlarındaki yetkinlik dağılımı.'
      : 'A visual breakdown of proficiency across backend architecture, cloud infrastructure, and performance optimization layers.';

  return (
    <div className="space-y-12">
      <div className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 shadow-lg">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative z-10">
          <span className="pulse-effect mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-secondary">
            <span className="text-primary">◉</span>
            {heroBadge}
          </span>
          <h1 className="hero-glow mb-4 text-4xl font-bold tracking-tight">{heroTitle}</h1>
          <p className="max-w-2xl text-lg text-on-surface-variant">{heroBody}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {primary && (
          <div className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-6 lg:col-span-2">
            <h2 className="mb-6 text-2xl font-semibold text-secondary">{primary}</h2>
            <div className="space-y-6">
              {grouped[primary].map((item) => (
                <ProgressBar
                  key={item.id}
                  item={item}
                  locale={locale}
                  showDescription={!!item.description}
                />
              ))}
            </div>
          </div>
        )}

        {secondary.length > 0 && (
          <div className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high p-6">
            <h2 className="mb-6 text-2xl font-semibold text-tertiary-container">
              {secondary[0]}
            </h2>
            <div className="space-y-6">
              {grouped[secondary[0]].map((item) => (
                <ProgressBar
                  key={item.id}
                  item={item}
                  locale={locale}
                  accent="green"
                  showDescription={!!item.description}
                />
              ))}
            </div>

            {settings && (
              <div className="mt-8 border-t border-outline-variant pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="tech-badge rounded-lg border border-outline-variant/30 bg-background/50 p-3 text-center">
                    <span className="block text-2xl font-semibold text-primary">
                      {settings.statDeployments}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      {settings.statDeploymentsLabel ?? 'Deployments'}
                    </span>
                  </div>
                  <div className="tech-badge rounded-lg border border-outline-variant/30 bg-background/50 p-3 text-center">
                    <span className="block text-2xl font-semibold text-secondary">
                      {settings.statUptime}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant">
                      {settings.statUptimeLabel ?? 'Uptime'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {secondary.slice(1).map((cat) => (
        <div
          key={cat}
          className="scanline-container relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-6"
        >
          <h2 className="mb-6 text-xl font-semibold">{cat}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {grouped[cat].map((item) => (
              <ProgressBar
                key={item.id}
                item={item}
                locale={locale}
                showDescription={!!item.description}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
