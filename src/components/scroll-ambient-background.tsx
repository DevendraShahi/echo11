"use client";

import { useEffect, useRef } from "react";

type ScrollAmbientBackgroundProps = {
  className?: string;
};

type AmbientLine = {
  amplitude: number;
  phase: number;
  speed: number;
  offset: number;
};

type AmbientParticle = {
  x: number;
  y: number;
  size: number;
  depth: number;
  speed: number;
  phase: number;
  driftX: number;
};

const LINE_COUNT = 12;
const PARTICLE_COUNT = 56;

function wrap(value: number, limit: number) {
  if (!limit) {
    return 0;
  }

  return ((value % limit) + limit) % limit;
}

export function ScrollAmbientBackground({
  className = "",
}: ScrollAmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let scrollY = window.scrollY || 0;
    let rafId = 0;

    const lines: AmbientLine[] = Array.from({ length: LINE_COUNT }, (_, idx) => ({
      amplitude: 7 + (idx % 4) * 3.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + idx * 0.04,
      offset: Math.random() * Math.PI * 2,
    }));

    const particles: AmbientParticle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        x: Math.random(),
        y: Math.random(),
        size: 1.2 + Math.random() * 1.6,
        depth: 0.4 + Math.random() * 0.9,
        speed: 0.35 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.08,
      }),
    );

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const draw = (timeMs: number) => {
      if (!width || !height) {
        return;
      }

      const time = timeMs * 0.001;
      const scrollDrift = scrollY * 0.00038;

      ctx.clearRect(0, 0, width, height);

      const baseGradient = ctx.createLinearGradient(0, 0, 0, height);
      baseGradient.addColorStop(0, "rgba(7, 11, 17, 0.92)");
      baseGradient.addColorStop(0.56, "rgba(8, 14, 23, 0.78)");
      baseGradient.addColorStop(1, "rgba(6, 10, 16, 0.94)");
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width * 0.62,
        height * 0.28,
        height * 0.1,
        width * 0.62,
        height * 0.28,
        height * 0.86,
      );
      glow.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      glow.addColorStop(0.52, "rgba(56, 189, 248, 0.08)");
      glow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      lines.forEach((line, idx) => {
        const yBase = (idx / (LINE_COUNT - 1)) * height * 1.24 - height * 0.12;
        const opacity = 0.05 + idx * 0.008;

        ctx.beginPath();
        for (let x = -24; x <= width + 24; x += 24) {
          const waveA = Math.sin(
            x * 0.0041 + time * line.speed + line.phase + scrollDrift * (1.2 + idx * 0.04),
          );
          const waveB = Math.cos(
            x * 0.0019 - time * (0.4 + idx * 0.03) + line.offset + scrollDrift * 0.66,
          );
          const y = yBase + waveA * line.amplitude + waveB * (line.amplitude * 0.64);

          if (x <= -24) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(30, 143, 196, ${opacity.toFixed(3)})`;
        ctx.lineWidth = 0.84;
        ctx.stroke();
      });

      particles.forEach((particle) => {
        const x =
          wrap(
            particle.x * width +
              Math.sin(time * particle.speed + particle.phase) * 20 +
              scrollY * particle.driftX,
            width,
          ) - particle.size / 2;
        const y =
          wrap(
            particle.y * height +
              Math.cos(time * (particle.speed * 0.76) + particle.phase) * 14 +
              scrollY * (0.022 * particle.depth),
            height,
          ) - particle.size / 2;
        const alpha = 0.12 + (Math.sin(time * 1.8 + particle.phase) + 1) * 0.12;

        ctx.fillStyle = `rgba(56, 189, 248, ${(alpha * particle.depth).toFixed(3)})`;
        ctx.fillRect(x, y, particle.size, particle.size);
      });

      ctx.restore();
    };

    const render = (timeMs: number) => {
      draw(timeMs);

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (prefersReducedMotion) {
      draw(0);
    } else {
      rafId = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`scroll-ambient-layer ${className}`.trim()} aria-hidden="true">
      <canvas className="scroll-ambient-canvas" ref={canvasRef} />
    </div>
  );
}
