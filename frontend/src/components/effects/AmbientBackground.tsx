import { FloatingDecor } from '@/components/effects/FloatingDecor';
import { ParticleCanvas } from '@/components/effects/ParticleCanvas';

interface AmbientBackgroundProps {
  /** Ana sayfa için yüzen ikonlar */
  showFloatingDecor?: boolean;
}

/**
 * Tüm sayfalarda ortak Dracula atmosfer katmanları.
 */
export function AmbientBackground({ showFloatingDecor = false }: AmbientBackgroundProps) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 dracula-gradient" />
      <ParticleCanvas />
      <div className="pointer-events-none absolute inset-0 -z-10 synthwave-grid opacity-30" />
      {showFloatingDecor && <FloatingDecor />}
    </>
  );
}
