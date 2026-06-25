/**
 * Yüzen dekoratif ikonlar — portfolio tasarımındaki arka plan öğeleri.
 */
export function FloatingDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="float-animation absolute top-40 right-20 opacity-20">
        <span className="font-mono text-[80px] text-primary">⬡</span>
      </div>
      <div className="float-delayed absolute bottom-40 right-40 opacity-20">
        <span className="font-mono text-[60px] text-tertiary">◇</span>
      </div>
      <div className="float-slow absolute top-80 left-10 opacity-20">
        <span className="font-mono text-[50px] text-secondary">☁</span>
      </div>
    </div>
  );
}
