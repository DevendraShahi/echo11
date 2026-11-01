"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { MotionValue } from "framer-motion";

type Ping = { x: number; y: number; age: number };

type Layer = {
  /** 0 at the horizon (far), 1 at the front (near) */
  depth: number;
  /** px offset from the horizon; negative sits above it */
  offset: number;
  amplitude: number;
  wavelength: number;
  /** relative phase speed under scroll scrubbing */
  speed: number;
  lineWidth: number;
  alpha: number;
  rgb: [number, number, number];
  /** radians of phase lag per echo copy; 0 draws no echoes */
  echoLag: number;
};

/** Layout of the host's wordmark span, in canvas coordinates. */
type AnchorMetrics = {
  left: number;
  top: number;
  height: number;
  lineHeight: number;
  width: number;
  font: string;
  baseline: number;
  letters: { ch: string; x: number; adv: number }[];
};

const TAU = Math.PI * 2;
const SEGMENT = 5;
/** Where the band sits when no wordmark has been measured yet. */
const AXIS_FALLBACK = 0.56;
/** Radians of phase travel across the full hero scroll, per unit of speed. */
const SCROLL_TRAVEL = 16;
/** Radians of autonomous drift per second, per unit of speed. Deliberately
 *  slow: the field breathes, it never rushes. */
const TIME_DRIFT = 0.25;
/** Ring expansion speed for a ping, px per second. */
const PING_SPEED = 540;
/** Radius of the pointer's influence on wave amplitude, px. */
const SIGMA = 190;
const MAX_PINGS = 6;
const PING_LIFETIME = 2.9;
/** Seconds for the wordmark letters to rise into place once released. */
const WORD_DURATION = 1.3;
const STAGGER = 0.06;
const LETTER_RISE = 0.55;

/**
 * Nine ribbons recede from a shared horizon: distant lines are short, thin and
 * dim; near lines are long, bright cyan and carry the most energy. The three
 * front layers also trail two decaying copies of themselves, so the field shows
 * what the brand is named after: a signal and its echoes.
 */
const LAYERS: Layer[] = [
  { depth: 0.0, offset: -30, amplitude: 15, wavelength: 300, speed: 0.4, lineWidth: 0.55, alpha: 0.09, rgb: [150, 165, 175], echoLag: 0 },
  { depth: 0.12, offset: -16, amplitude: 21, wavelength: 375, speed: 0.48, lineWidth: 0.6, alpha: 0.12, rgb: [150, 170, 182], echoLag: 0 },
  { depth: 0.25, offset: -2, amplitude: 28, wavelength: 455, speed: 0.56, lineWidth: 0.7, alpha: 0.15, rgb: [96, 218, 245], echoLag: 0 },
  { depth: 0.38, offset: 14, amplitude: 36, wavelength: 545, speed: 0.66, lineWidth: 0.8, alpha: 0.17, rgb: [96, 218, 245], echoLag: 0 },
  { depth: 0.5, offset: 32, amplitude: 45, wavelength: 650, speed: 0.76, lineWidth: 0.9, alpha: 0.2, rgb: [0, 229, 255], echoLag: 1.3 },
  { depth: 0.62, offset: 52, amplitude: 54, wavelength: 775, speed: 0.86, lineWidth: 1.0, alpha: 0.26, rgb: [0, 229, 255], echoLag: 1.5 },
  { depth: 0.74, offset: 74, amplitude: 64, wavelength: 920, speed: 0.97, lineWidth: 1.15, alpha: 0.31, rgb: [125, 235, 255], echoLag: 1.7 },
  { depth: 0.86, offset: 96, amplitude: 76, wavelength: 1090, speed: 1.08, lineWidth: 1.3, alpha: 0.36, rgb: [0, 229, 255], echoLag: 1.9 },
  { depth: 1.0, offset: 120, amplitude: 90, wavelength: 1280, speed: 1.2, lineWidth: 1.5, alpha: 0.44, rgb: [0, 229, 255], echoLag: 2.1 },
];

/** Smooth 0..1 ramp so the field arrives with the type instead of before it. */
function ramp(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

type EchoFieldProps = {
  /** Flip true when the splash handoff releases the hero entrance. */
  active: boolean;
  /** The hero's giant wordmark span. The field is masked to its glyphs. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Hero scroll progress (0 at rest, 1 when the stage has scrolled away). */
  progress: MotionValue<number>;
  /** Fired after a wordmark frame is painted; the host keeps its text fallback until then. */
  onReady?: () => void;
};

/**
 * The echo, made literal.
 *
 * The wave field renders offscreen and is painted onto the wordmark's
 * letterforms: the word is built from signal. The phase drifts slowly on its
 * own — a calm, continuous breath — and scroll adds further travel on top, so
 * the field sweeps as the stage moves. Pointer motion lifts amplitude locally
 * and a click sends a ring through the letters. The loop sleeps whenever the
 * stage scrolls out of view or motion is reduced.
 */
export function EchoField({ active, anchorRef, progress, onReady }: EchoFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    let context: CanvasRenderingContext2D | null;
    try { context = canvas.getContext("2d"); } catch { return; }
    const ctx = context;
    if (!ctx) return;
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;
    let disposed = false;
    let ready = false;

    let rafId = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    const energyTarget = reduceMotion || active ? 1 : 0;
    let energy = reduceMotion ? 1 : 0;
    let wordT = reduceMotion ? 1 : 0;
    /** Autonomous clock: the field's resting heartbeat, seconds. */
    let time = 0;
    /** Scroll phase, radians. Adds to the drift while the stage moves. */
    let scrollPhase = progress.get() * SCROLL_TRAVEL;
    let lastProgress = progress.get();
    /** pointer position in canvas space; starts offstage */
    let pointerX = -1e4;
    let pointerY = -1e4;
    /** 0..1, lifts on movement and decays while the loop runs */
    let boost = 0;
    let anchor: AnchorMetrics | null = null;
    const pings: Ping[] = [];

    const measureAnchor = () => {
      const el = anchorRef.current;
      if (!el) {
        anchor = null;
        return;
      }
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        anchor = null;
        return;
      }
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      if (!fontSize) {
        anchor = null;
        return;
      }
      const lineHeight = parseFloat(style.lineHeight) || fontSize;
      const letterSpacing = parseFloat(style.letterSpacing) || 0;
      const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      offCtx.font = font;
      const probe = offCtx.measureText("Hg");
      const ascent = probe.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = probe.fontBoundingBoxDescent ?? fontSize * 0.2;
      // The canvas box shares the host's transform, so subtracting it lands
      // the wordmark in canvas space.
      const canvasRect = canvas.getBoundingClientRect();
      const left = rect.left - canvasRect.left;
      const top = rect.top - canvasRect.top;
      const baseline = top + (lineHeight - (ascent + descent)) / 2 + ascent;
      const letters: AnchorMetrics["letters"] = [];
      let x = left;
      for (const ch of el.textContent ?? "") {
        const adv = offCtx.measureText(ch).width;
        letters.push({ ch, x, adv });
        x += adv + letterSpacing;
      }
      anchor = { left, top, height: rect.height, lineHeight, width: rect.width, font, baseline, letters };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = canvas.width;
      off.height = canvas.height;
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureAnchor();
    };

    const spawnPing = (x: number, y: number) => {
      if (reduceMotion) return;
      pings.push({ x, y, age: 0 });
      while (pings.length > MAX_PINGS) pings.shift();
    };

    /** One ribbon, optionally one of its trailing echo copies. */
    const strokeLayer = (
      target: CanvasRenderingContext2D,
      layer: Layer,
      baseY: number,
      amplitude: number,
      phaseLag: number,
      alpha: number,
      lineWidth: number,
      parallaxX: number,
      parallaxPhase: number,
    ) => {
      const [r, g, b] = layer.rgb;
      const gradient = target.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      gradient.addColorStop(0.06, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.94, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      target.beginPath();
      let started = false;
      // Phase = slow autonomous drift + scroll scrubbing: the field breathes
      // at rest and sweeps further as the stage scrolls.
      const phase = (scrollPhase + time * TIME_DRIFT) * layer.speed;

      for (let x = 0; x <= width; x += SEGMENT) {
        const p = x / width;
        // Swells mid-stage and eases toward the horizon at the edges, with a
        // floor so glyph areas away from centre still catch signal.
        const envelopeRaw = (Math.sin(p * TAU - Math.PI / 2) + 1) * 0.5;
        const envelope = 0.45 + 0.55 * envelopeRaw;
        const proximity =
          pointerX > -1e3
            ? Math.exp(-((x - pointerX) * (x - pointerX)) / (2 * SIGMA * SIGMA)) * boost
            : 0;
        const localAmp = amplitude * envelope * (1 + proximity * 0.75);

        let angle = x / layer.wavelength * TAU - phase * 1.7 + phaseLag + parallaxPhase;
        // Sum a quiet second harmonic so the near ribbons read as water, not
        // as a textbook sine.
        angle += Math.sin(x / (layer.wavelength * 0.37) - phase * 0.9) * 0.35 * layer.depth;

        let y = baseY + localAmp * Math.sin(angle);

        // A passing ping lifts the ribbon as its ring front crosses.
        for (const ping of pings) {
          const radius = ping.age * PING_SPEED;
          const dx = x - ping.x;
          const dy = baseY - ping.y;
          const ringDist = Math.abs(Math.hypot(dx, dy) - radius);
          if (ringDist < 150) {
            y -=
              Math.exp(-(ringDist * ringDist) / (2 * 54 * 54)) *
              Math.exp(-ping.age * 1.7) *
              48 *
              ramp(energy);
          }
        }

        const px = x + parallaxX;
        if (!started) {
          target.moveTo(px, y);
          started = true;
        } else {
          target.lineTo(px, y);
        }
      }

      // Soft additive halo first, crisp line second: light rather than wire.
      target.globalCompositeOperation = "lighter";
      target.lineWidth = lineWidth * 8;
      target.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.075})`;
      target.stroke();

      target.globalCompositeOperation = "source-over";
      target.lineWidth = lineWidth;
      target.strokeStyle = gradient;
      target.stroke();
    };

    /** The whole field, drawn into the offscreen buffer (band follows the word). */
    const drawField = (target: CanvasRenderingContext2D) => {
      const e = ramp(energy);
      target.clearRect(0, 0, width, height);
      target.lineCap = "round";
      target.lineJoin = "round";

      const fieldScale = Math.min(1.2, Math.max(0.55, Math.min(height / 900, width / 1100)));
      const waveScale = Math.min(1.2, Math.max(0.5, width / 1280));
      const axis = anchor ? anchor.top + anchor.height / 2 : height * AXIS_FALLBACK;
      // Spread the layers across the wordmark's height so glyphs fill with signal.
      const spread = anchor ? Math.min(2.4, Math.max(0.9, anchor.height / 170)) : fieldScale;
      const parallaxNormX = pointerX > -1e3 ? (pointerX / width - 0.5) * 2 : 0;
      const parallaxNormY = pointerY > -1e3 ? (pointerY / height - 0.5) * 2 : 0;

      for (const layer of LAYERS) {
        const baseY = axis + (layer.offset - 45) * spread + parallaxNormY * layer.depth * 9;
        const parallaxX = parallaxNormX * layer.depth * 22;
        const parallaxPhase = parallaxNormX * layer.depth * 0.7;
        const amplitude = layer.amplitude * fieldScale * e;
        const wavelength = Math.max(160, layer.wavelength * waveScale);
        const scaled: Layer = { ...layer, wavelength };

        if (layer.echoLag > 0) {
          strokeLayer(target, scaled, baseY, amplitude * 0.75, layer.echoLag * 2, layer.alpha * e * 0.16, layer.lineWidth * 0.8, parallaxX, parallaxPhase);
          strokeLayer(target, scaled, baseY, amplitude * 0.88, layer.echoLag, layer.alpha * e * 0.38, layer.lineWidth * 0.9, parallaxX, parallaxPhase);
        }
        strokeLayer(target, scaled, baseY, amplitude, 0, layer.alpha * e, layer.lineWidth, parallaxX, parallaxPhase);
      }
    };

    const draw = () => {
      if (!width || !height) return;
      drawField(offCtx);

      ctx.clearRect(0, 0, width, height);

      // 1) The wordmark: each glyph rises inside its own line-box mask as a
      //    cyan-wash slab, then the field is painted on top of it, clipped to
      //    the glyph — the word gets a body, with signal running through it.
      if (anchor && wordT > 0) {
        const letters = anchor.letters;
        const windowSize = LETTER_RISE + (letters.length - 1) * STAGGER;
        const clock = wordT * windowSize;
        ctx.font = anchor.font;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        // Opaque colours equal to cyan-over-black at their alpha, so the
        // glyph silhouette stays fully opaque for the atop pass below.
        const wash = ctx.createLinearGradient(0, anchor.top, 0, anchor.top + anchor.lineHeight);
        wash.addColorStop(0, "rgb(0, 144, 160)");
        wash.addColorStop(0.55, "rgb(0, 128, 142)");
        wash.addColorStop(1, "rgb(0, 112, 128)");
        ctx.fillStyle = wash;
        for (let i = 0; i < letters.length; i++) {
          const letter = letters[i];
          const t = clamp01((clock - i * STAGGER) / LETTER_RISE);
          if (t <= 0) continue;
          const eased = easeOutCubic(t);
          ctx.save();
          ctx.beginPath();
          ctx.rect(letter.x - 4, anchor.top, letter.adv + 10, anchor.lineHeight);
          ctx.clip();
          ctx.globalAlpha = Math.min(1, t * 1.6);
          ctx.fillText(letter.ch, letter.x, anchor.baseline + (1 - eased) * anchor.lineHeight);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        // Atop keeps the glyph's own alpha: signal shows only on the letters.
        ctx.globalCompositeOperation = "source-atop";
        ctx.filter = "brightness(1.35)";
        ctx.drawImage(off, 0, 0, width, height);
        ctx.filter = "none";
        ctx.globalCompositeOperation = "source-over";
        if (!ready) { ready = true; onReady?.(); }
      }

      // 2) A faint pass of the same field escapes the letters, so the signal
      //    reads across the whole stage, not just inside the word.
      ctx.globalAlpha = 0.3;
      ctx.drawImage(off, 0, 0, width, height);
      ctx.globalAlpha = 1;

      // 3) Pings ride at full strength above everything: the ring is the
      //    interface's answer, so it must read on black and on the letters.
      if (pings.length) {
        ctx.globalCompositeOperation = "lighter";
        for (const ping of pings) {
          const radius = ping.age * PING_SPEED;
          const fade = Math.exp(-ping.age * 1.55);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.5 * fade})`;
          ctx.beginPath();
          ctx.arc(ping.x, ping.y, radius, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 11;
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 * fade})`;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      energy += (energyTarget - energy) * (1 - Math.exp(-dt * 2.4));
      if (active && wordT < 1) wordT = Math.min(1, wordT + dt / WORD_DURATION);
      boost += (0 - boost) * (1 - Math.exp(-dt * 1.6));

      for (const ping of pings) ping.age += dt;
      for (let i = pings.length - 1; i >= 0; i--) {
        if (pings[i].age > PING_LIFETIME) pings.splice(i, 1);
      }

      draw();
      // Runs while the stage is on screen; sleeps when it scrolls away.
      rafId = visible && active && !document.hidden && progress.get() < 0.6 ? window.requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (rafId || reduceMotion || !visible || !active || document.hidden || progress.get() >= 0.6) return;
      last = performance.now();
      rafId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      resize();
      if (!width || !height) {
        rafId = window.requestAnimationFrame(start);
        return;
      }
      draw();
      if (!reduceMotion) wake();
    };

    const handleResize = () => {
      resize();
      draw();
    };

    // Pointer: parallax and amplitude respond to where you are on the field.
    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion || !visible || document.hidden || progress.get() >= 0.6) return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      boost = Math.min(1, boost + 0.09);
      wake();
    };

    // Clicks on the open stage send a ring through the wordmark. Interactive
    // elements keep their own behaviour and never reach here.
    const handlePointerDown = (event: PointerEvent) => {
      if (reduceMotion || !visible || document.hidden || progress.get() >= 0.6) return;
      const target = event.target as Element | null;
      if (target?.closest("a, button, input, textarea, select, [role='button']")) return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      spawnPing(event.clientX - rect.left, event.clientY - rect.top);
      wake();
    };

    // Scroll adds travel on top of the drift: the hero's progress motion
    // value scrubs the phase further as the stage moves.
    const handleProgress = (value: number) => {
      if (Math.abs(value - lastProgress) < 0.0004) return;
      lastProgress = value;
      scrollPhase = value * SCROLL_TRAVEL;
      wake();
    };

    start();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(canvas);
    if (anchorRef.current) resizeObserver?.observe(anchorRef.current);
    window.addEventListener("resize", handleResize);
    const unsubscribeProgress = progress.on("change", handleProgress);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    const handleVisibility = () => {
      if (document.hidden && rafId) { window.cancelAnimationFrame(rafId); rafId = 0; }
      else wake();
    };
    const handleMotion = () => {
      reduceMotion = motionQuery.matches;
      if (reduceMotion) {
        window.cancelAnimationFrame(rafId); rafId = 0;
        energy = 1; wordT = 1; boost = 0; pings.length = 0;
        draw();
      } else wake();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotion);

    // The wordmark can shift once the webfont lands; re-measure then.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measureAnchor();
      draw();
    });

    // Idle when scrolled away, so the field never runs behind the rest of the page.
    const visibilityObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible) wake();
              if (!visible && rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
              }
            },
            { threshold: 0 },
          )
        : null;
    visibilityObserver?.observe(canvas);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      unsubscribeProgress();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [active, anchorRef, progress, onReady]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 cursor-crosshair" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
