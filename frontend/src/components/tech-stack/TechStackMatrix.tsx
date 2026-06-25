import Image from 'next/image';
import Link from 'next/link';
import type { SiteSettings, TechStackItem } from '@/lib/api/types';

interface TechStackMatrixProps {
  items: TechStackItem[];
  settings: SiteSettings | null;
  locale: string;
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

function ProgressBar({
  item,
  locale,
  accent = 'secondary',
}: {
  item: TechStackItem;
  locale: string;
  accent?: 'secondary' | 'green';
}) {
  const barClass =
    accent === 'green'
      ? 'bg-dracula-green glow-green bar-fill-animate'
      : 'bg-secondary glow-cyan bar-fill-animate';
  const textClass = accent === 'green' ? 'text-dracula-green' : 'text-secondary';

  return (
    <Link
      href={`/${locale}/tech-stack/${item.id}`}
      className="group block space-y-2 rounded-lg p-2 transition-all hover:bg-surface-container-highest/50 active:scale-[0.99]"
    >
      <div className="flex justify-between font-mono text-sm">
        <span className="flex items-center gap-2 text-on-background transition-colors group-hover:text-primary">
          {item.imageUrl && (
            <span className="relative inline-block h-6 w-6 overflow-hidden rounded transition-transform group-hover:scale-110">
              <Image src={item.imageUrl} alt="" fill className="object-cover" />
            </span>
          )}
          {item.name}
        </span>
        <span className={textClass}>{item.proficiencyLevel}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className={`h-full transition-all duration-1000 ease-out ${barClass}`}
          style={{ width: `${item.proficiencyLevel}%` }}
        />
      </div>
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
                <ProgressBar key={item.id} item={item} locale={locale} />
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
              <div key={item.id}>
                <ProgressBar item={item} locale={locale} />
                {item.description && (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
