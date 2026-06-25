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
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      this.opacity = Math.random() * 0.5;
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
 * Arka plan parçacık sistemi — design/emre_k_l_portfolio_dracula_animated
 */
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let frameId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.floor((canvas.width * canvas.height) / 10000);
      particles = Array.from({ length: count }, () =>
        createParticle(canvas.width, canvas.height),
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.update(canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden />;
}
