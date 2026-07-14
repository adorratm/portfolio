'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#bd93f9', '#ff79c6', '#8be9fd'];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  reset: (w: number, h: number) => void;
  update: (w: number, h: number) => void;
}

function createParticle(w: number, h: number): Particle {
  const p: Particle = {
    x: 0,
    y: 0,
    size: 0,
    speedX: 0,
    speedY: 0,
    color: COLORS[0],
    opacity: 0,
    reset(cw, ch) {
      this.x = Math.random() * cw;
      this.y = Math.random() * ch;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      this.opacity = Math.random() * 0.45;
    },
    update(cw, ch) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > cw || this.y < 0 || this.y > ch) {
        this.reset(cw, ch);
      }
    },
  };
  p.reset(w, h);
  return p;
}

/**
 * Arka plan parçacıkları — idle sonrası, düşük yoğunluk, sekme gizliyken durur.
 */
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let frameId = 0;
    let running = false;
    let cancelled = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => createParticle(w, h));
    };

    const draw = () => {
      if (!running || cancelled) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.update(w, h);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (cancelled || running || document.hidden) return;
      running = true;
      resize();
      draw();
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    let idleHandle: number | ReturnType<typeof setTimeout>;
    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(() => start(), { timeout: 800 });
    } else {
      idleHandle = setTimeout(() => start(), 200);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if ('cancelIdleCallback' in window && typeof idleHandle === 'number') {
        window.cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden />;
}
