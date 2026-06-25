'use client';

import { useLiveMetrics } from '@/hooks/useLiveMetrics';
import { useLocaleContent } from '@/providers/LocaleProvider';

/**
 * Canlı metrikler — etiketler backend adminLabels'den gelir.
 */
export function MetricsBento() {
  const metrics = useLiveMetrics();
  const { t } = useLocaleContent();

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
      <MetricCard
        label={t('metrics.cpu', 'CPU UTILIZATION')}
        value={metrics ? `${metrics.cpuPercent}%` : '—'}
        sublabel={t('metrics.normalRange', 'Normal Range')}
        accent="text-primary"
      />
      <MetricCard
        label={t('metrics.ram', 'RAM USAGE')}
        value={metrics ? `${metrics.ramUsedGb}GB` : '—'}
        sublabel={
          metrics
            ? `${t('metrics.total', 'Total')}: ${metrics.ramTotalGb}GB`
            : ''
        }
        accent="text-secondary"
      />
      <MetricCard
        label={t('metrics.uptime', 'UPTIME')}
        value={metrics?.uptimeLabel ?? '—'}
        sublabel={t('metrics.sla', 'SLA: 99.9%')}
        accent="text-dracula-green"
      />
    </div>
  );
}

function MetricCard({
  label: cardLabel,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="scanline-effect relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {cardLabel}
      </span>
      <div className={`mt-4 text-4xl font-bold ${accent}`}>{value}</div>
      <p className="mt-1 text-xs text-on-surface-variant">{sublabel}</p>
    </div>
  );
}
