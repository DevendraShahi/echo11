"use client";

import { useEffect, useRef } from "react";

export type MotionGlyphVariant =
  | "sphere-scan"
  | "crystalline-refraction"
  | "sonar-sweep"
  | "helix-scanner"
  | "interconnecting-waves"
  | "cylindrical-analysis"
  | "voxel-matrix-morph"
  | "phased-array-emitter"
  | "crystalline-cube-refraction";

const TAU = Math.PI * 2;

export function MotionGlyph({
  variant,
  className = "",
}: {
  variant: MotionGlyphVariant;
  className?: string;
}) {
  return (
    <div className={`motion-glyph ${className}`.trim()}>
      <SignalGlyphCanvas variant={variant} />
    </div>
  );
}

function SignalGlyphCanvas({ variant }: { variant: MotionGlyphVariant }) {
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
    let size = 0;
    let visible = true;
    let rafId = 0;

    const resize = () => {
      const nextSize = Math.max(120, Math.floor(canvas.clientWidth));

      if (!nextSize || nextSize === size) {
        return;
      }

      size = nextSize;
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawGlyph(ctx, variant, 4.2, size);
      }
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              visible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0.08 },
          )
        : null;

    if (observer) {
      observer.observe(canvas);
    }

    const render = (time: number) => {
      if (!size) {
        resize();
      }

      if (!size) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      if (prefersReducedMotion) {
        drawGlyph(ctx, variant, 4.2, size);
        return;
      }

      if (visible) {
        drawGlyph(ctx, variant, time * 0.001, size);
      }

      rafId = window.requestAnimationFrame(render);
    };

    resize();
    rafId = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      observer?.disconnect();
    };
  }, [variant]);

  return <canvas aria-hidden="true" className="motion-canvas" ref={canvasRef} />;
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  variant: MotionGlyphVariant,
  time: number,
  size: number,
) {
  const center = size / 2;
  const radius = size * 0.37;

  ctx.clearRect(0, 0, size, size);

  switch (variant) {
    case "sphere-scan":
      drawSphereScan(ctx, center, radius, time);
      break;
    case "crystalline-refraction":
      drawCrystallineRefraction(ctx, center, radius, time);
      break;
    case "sonar-sweep":
      drawSonarSweep(ctx, center, radius, time);
      break;
    case "helix-scanner":
      drawHelixScanner(ctx, center, radius, time);
      break;
    case "interconnecting-waves":
      drawInterconnectingWaves(ctx, center, radius, time);
      break;
    case "cylindrical-analysis":
      drawCylindricalAnalysis(ctx, center, radius, time);
      break;
    case "voxel-matrix-morph":
      drawVoxelMatrixMorph(ctx, center, radius, time);
      break;
    case "phased-array-emitter":
      drawPhasedArrayEmitter(ctx, center, radius, time);
      break;
    case "crystalline-cube-refraction":
      drawCrystallineCubeRefraction(ctx, center, radius, time);
      break;
    default:
      break;
  }
}

function drawSphereScan(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const rows = 13;
  const cols = 24;

  for (let row = 0; row < rows; row += 1) {
    const lat = -Math.PI / 2 + (row / (rows - 1)) * Math.PI;

    for (let col = 0; col < cols; col += 1) {
      const lon = (col / cols) * TAU;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      const rotA = time * 0.52;
      const rotB = time * 0.28;
      const xA = x * Math.cos(rotA) - z * Math.sin(rotA);
      const zA = x * Math.sin(rotA) + z * Math.cos(rotA);
      const yB = y * Math.cos(rotB) - zA * Math.sin(rotB);
      const zB = y * Math.sin(rotB) + zA * Math.cos(rotB);
      const perspective = 1 / (1.65 - zB);
      const px = center + xA * radius * 0.88 * perspective;
      const py = center + yB * radius * 0.88 * perspective;
      const alpha = 0.22 + ((zB + 1) / 2) * 0.64;

      ctx.fillStyle = `rgba(138, 224, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(px, py, 1.6, 1.6);
    }
  }

  const sweepY = center + Math.sin(time * 1.7) * radius * 0.8;
  const sweep = ctx.createLinearGradient(center - radius, sweepY, center + radius, sweepY);
  sweep.addColorStop(0, "rgba(0, 0, 0, 0)");
  sweep.addColorStop(0.5, "rgba(110, 242, 207, 0.42)");
  sweep.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.strokeStyle = sweep;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center - radius, sweepY);
  ctx.lineTo(center + radius, sweepY);
  ctx.stroke();
}

function drawCrystallineRefraction(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const shards = 22;

  for (let i = 0; i < shards; i += 1) {
    const angle = (i / shards) * TAU + time * 0.42;
    const depth = 0.26 + ((i % 6) / 6) * 0.7;
    const rA = radius * depth;
    const rB = radius * (depth + 0.14);
    const x1 = center + Math.cos(angle) * rA;
    const y1 = center + Math.sin(angle) * rA;
    const x2 = center + Math.cos(angle + 0.16) * rB;
    const y2 = center + Math.sin(angle + 0.16) * rB;

    ctx.strokeStyle = `rgba(134, 212, 255, ${(0.22 + depth * 0.46).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawSonarSweep(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  for (let i = 1; i <= 7; i += 1) {
    const growth = 0.93 + Math.sin(time * 1.7 - i * 0.6) * 0.04;
    const ring = radius * (i / 7) * growth;
    ctx.strokeStyle = `rgba(143, 217, 255, ${(0.08 + i * 0.05).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, ring, 0, TAU);
    ctx.stroke();
  }

  const angle = time * 1.4;
  const x = center + Math.cos(angle) * radius;
  const y = center + Math.sin(angle) * radius;
  const beam = ctx.createRadialGradient(center, center, 0, center, center, radius);
  beam.addColorStop(0, "rgba(110, 242, 207, 0.4)");
  beam.addColorStop(1, "rgba(110, 242, 207, 0)");
  ctx.strokeStyle = beam;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(x, y);
  ctx.stroke();
}

function drawHelixScanner(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  for (let i = -28; i <= 28; i += 1) {
    const k = i / 28;
    const y = center + k * radius * 0.82;
    const phase = i * 0.38 + time * 2.1;
    const xA = center + Math.sin(phase) * radius * 0.56;
    const xB = center - Math.sin(phase) * radius * 0.56;
    const alpha = 0.18 + ((Math.cos(phase) + 1) / 2) * 0.5;

    ctx.fillStyle = `rgba(150, 224, 255, ${alpha.toFixed(3)})`;
    ctx.fillRect(xA, y, 1.8, 1.8);
    ctx.fillRect(xB, y, 1.8, 1.8);
  }

  const scanX = center + Math.sin(time * 0.68) * radius * 0.62;
  ctx.strokeStyle = "rgba(110, 242, 207, 0.26)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(scanX, center - radius);
  ctx.lineTo(scanX, center + radius);
  ctx.stroke();
}

function drawInterconnectingWaves(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const rings = [0.3, 0.52, 0.75];
  const pointsPerRing = 22;
  const ringPoints: Array<Array<{ x: number; y: number }>> = [];

  rings.forEach((ringFactor, ringIndex) => {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < pointsPerRing; i += 1) {
      const base = (i / pointsPerRing) * TAU;
      const wobble = Math.sin(time * 1.8 + i * 0.28 + ringIndex) * radius * 0.03;
      const ringRadius = radius * ringFactor + wobble;
      const x = center + Math.cos(base + time * (0.16 + ringIndex * 0.07)) * ringRadius;
      const y = center + Math.sin(base + time * (0.16 + ringIndex * 0.07)) * ringRadius;
      points.push({ x, y });
      ctx.fillStyle = "rgba(147, 226, 255, 0.5)";
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    ringPoints.push(points);
  });

  ctx.strokeStyle = "rgba(127, 196, 239, 0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i < pointsPerRing; i += 1) {
    for (let ring = 0; ring < ringPoints.length - 1; ring += 1) {
      const a = ringPoints[ring][i];
      const b = ringPoints[ring + 1][(i + 2) % pointsPerRing];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

function drawCylindricalAnalysis(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  for (let i = 0; i <= 13; i += 1) {
    const t = i / 13;
    const y = center - radius * 0.8 + t * radius * 1.6;
    const rx = radius * (0.45 + 0.15 * Math.cos(time * 0.8 + t * TAU));
    const ry = radius * 0.12;
    ctx.strokeStyle = `rgba(128, 200, 242, ${(0.12 + t * 0.24).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(center, y, rx, ry, 0, 0, TAU);
    ctx.stroke();
  }

  const scanY = center + Math.sin(time * 1.1) * radius * 0.74;
  ctx.fillStyle = "rgba(110, 242, 207, 0.13)";
  ctx.fillRect(center - radius * 0.7, scanY - 6, radius * 1.4, 12);
}

function drawVoxelMatrixMorph(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const grid = 10;
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const nx = x / (grid - 1) - 0.5;
      const ny = y / (grid - 1) - 0.5;
      const depth =
        Math.sin(nx * 7 + time * 1.1) * Math.cos(ny * 7 - time * 1.3) * 0.22;
      const px = center + (nx + depth) * radius * 1.46;
      const py = center + (ny - depth) * radius * 1.46;
      const alpha = 0.22 + ((depth + 0.22) / 0.44) * 0.58;
      ctx.fillStyle = `rgba(142, 224, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(px, py, 2, 2);
    }
  }
}

function drawPhasedArrayEmitter(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const emitters = 64;
  for (let i = 0; i < emitters; i += 1) {
    const angle = (i / emitters) * TAU;
    const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 2.6 + i * 0.34));
    const inner = radius * 0.2;
    const outer = inner + radius * 0.67 * pulse;
    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * outer;
    const y2 = center + Math.sin(angle) * outer;
    ctx.strokeStyle = `rgba(148, 221, 255, ${(0.12 + pulse * 0.56).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawCrystallineCubeRefraction(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  time: number,
) {
  const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ] as const;

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ] as const;

  const projected = vertices.map(([x, y, z]) => {
    const rotY = rotateY(x, y, z, time * 0.75);
    const rotX = rotateX(rotY.x, rotY.y, rotY.z, time * 0.52);
    const depth = 1 / (3 + rotX.z);
    return {
      x: center + rotX.x * radius * 0.86 * depth * 2.4,
      y: center + rotX.y * radius * 0.86 * depth * 2.4,
      alpha: 0.24 + ((rotX.z + 1.2) / 2.4) * 0.46,
    };
  });

  edges.forEach(([a, b]) => {
    ctx.strokeStyle = "rgba(141, 222, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(projected[a].x, projected[a].y);
    ctx.lineTo(projected[b].x, projected[b].y);
    ctx.stroke();
  });

  ctx.strokeStyle = "rgba(110, 242, 207, 0.24)";
  ctx.beginPath();
  ctx.moveTo(projected[0].x, projected[0].y);
  ctx.lineTo(projected[6].x, projected[6].y);
  ctx.moveTo(projected[1].x, projected[1].y);
  ctx.lineTo(projected[7].x, projected[7].y);
  ctx.stroke();
}

function rotateY(x: number, y: number, z: number, angle: number) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    y,
    z: x * Math.sin(angle) + z * Math.cos(angle),
  };
}

function rotateX(x: number, y: number, z: number, angle: number) {
  return {
    x,
    y: y * Math.cos(angle) - z * Math.sin(angle),
    z: y * Math.sin(angle) + z * Math.cos(angle),
  };
}
