"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MousePointer2 } from "lucide-react";
import { markSplashDone } from "@/lib/splash";
import styles from "./SplashScreen.module.css";

const SPLASH_DURATION_MS = 1700;
const SPLASH_EXIT_MS = 650;
const AUDIO_FADE_MS = 320;
const SPLASH_SESSION_KEY = "echo11:splash-shown";
const COLOR_A = "hsla(0, 0%, 0%, .35)";
const COLOR_B = "hsla(186, 100%, 50%, .95)";

interface SplashConfig {
  circleCount: number;
  rad: number;
  echo: number;
  speed: number;
  pointCount: number;
  dotSize: number;
  centerY: number;
}

interface CircleState {
  r: number;
  e: boolean;
  max: number;
  min: number;
  val: number;
}

function getSplashConfig(width: number, height: number): SplashConfig {
  const mobile = width < 768;
  const tablet = width >= 768 && width < 1280;
  const base = Math.min(width, height);

  if (mobile) {
    return {
      circleCount: 8,
      rad: Math.max(96, base * 0.28),
      echo: 30,
      speed: 0.5,
      pointCount: 200,
      dotSize: 1.25,
      centerY: 0.38,
    };
  }

  if (tablet) {
    return {
      circleCount: 10,
      rad: Math.max(170, Math.min(base * 0.34, 300)),
      echo: 44,
      speed: 0.6,
      pointCount: 290,
      dotSize: 1.55,
      centerY: 0.39,
    };
  }

  return {
    circleCount: 12,
    rad: Math.max(220, Math.min(base * 0.36, 360)),
    echo: 58,
    speed: 0.68,
    pointCount: 360,
    dotSize: 1.75,
    centerY: 0.4,
  };
}

export function SplashScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const attemptedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);
  const exitingRef = useRef(false);
  const shownPathRef = useRef<string | null>(null);
  const dismissDurationRef = useRef<number>(SPLASH_DURATION_MS);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlockScroll = useCallback(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }, []);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
  }, []);

  const fadeOutAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      audio.volume = 1;
      return;
    }
    const from = audio.volume;
    const startedAt = performance.now();
    const step = (now: number) => {
      const current = audioRef.current;
      if (!current) {
        return;
      }
      const progress = Math.min(1, (now - startedAt) / AUDIO_FADE_MS);
      current.volume = from * (1 - progress);
      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }
      current.pause();
      current.currentTime = 0;
      current.volume = 1;
    };
    window.requestAnimationFrame(step);
  }, []);

  const clearDismissTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const beginExit = useCallback(() => {
    if (exitingRef.current) {
      return;
    }
    exitingRef.current = true;
    markSplashDone();
    setExiting(true);
    unlockScroll();
    fadeOutAudio();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    exitTimeoutRef.current = window.setTimeout(
      () => {
        exitTimeoutRef.current = null;
        setVisible(false);
        setExiting(false);
      },
      reduceMotion ? 0 : SPLASH_EXIT_MS,
    );
  }, [fadeOutAudio, unlockScroll]);

  const armDismissTimer = useCallback(() => {
    if (timeoutRef.current) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      beginExit();
    }, dismissDurationRef.current);
  }, [beginExit]);

  const enableSound = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || soundEnabled) {
      return;
    }
    audio.muted = false;
    audio.currentTime = 0;
    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      audio.volume = 1;
      return;
    }
    setSoundEnabled(true);
    const startedAt = performance.now();
    const step = (now: number) => {
      const current = audioRef.current;
      if (!current || current.paused) {
        return;
      }
      const progress = Math.min(1, (now - startedAt) / AUDIO_FADE_MS);
      current.volume = progress;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [soundEnabled]);

  useEffect(() => {
    if (!visible || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let rafId = 0;
    const circles: CircleState[] = [];
    let config = getSplashConfig(window.innerWidth, window.innerHeight);
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const x = (_x: number) => viewportWidth / 2 + _x;
    const y = (_y: number) => viewportHeight * config.centerY - _y;

    const createCircle = (index: number): CircleState => {
      const max = Math.random() * config.echo;
      const min = -Math.random() * config.echo;
      return {
        r: config.rad - (index * config.rad) / config.circleCount,
        e: index % 2 === 1,
        max,
        min,
        val: Math.random() * (max - min) + min,
      };
    };

    const fill = () => {
      context.fillStyle = COLOR_A;
      context.fillRect(0, 0, viewportWidth, viewportHeight);
    };

    const chk = (circle: CircleState) => {
      circle.val = circle.e ? circle.val + config.speed : circle.val - config.speed;
      if (circle.val < circle.min) {
        circle.e = true;
        circle.max = Math.random() * config.echo;
      }
      if (circle.val > circle.max) {
        circle.e = false;
        circle.min = -Math.random() * config.echo;
      }
    };

    const mv = (circle: CircleState) => {
      for (let i = 0; i < config.pointCount; i++) {
        const angle = (i * Math.PI * 2) / config.pointCount;
        const _x = Math.cos(angle) * (circle.r - circle.val * Math.cos(i / 2));
        const _y = Math.sin(angle) * (circle.r - circle.val * Math.cos(i / 2));
        context.fillStyle = COLOR_B;
        context.fillRect(x(_x), y(_y), config.dotSize, config.dotSize);
      }
      chk(circle);
    };

    const upd = () => {
      fill();
      for (let i = 0; i < circles.length; i++) {
        mv(circles[i]);
      }
    };

    const draw = () => {
      upd();
      rafId = window.requestAnimationFrame(draw);
    };

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      config = getSplashConfig(viewportWidth, viewportHeight);
      rootRef.current?.style.setProperty("--splash-center-y", `${config.centerY * 100}%`);
      circles.length = 0;
      for (let i = 0; i < config.circleCount; i++) {
        circles.push(createCircle(i));
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  useEffect(() => {
    const isAppSurface =
      pathname.startsWith("/lab") ||
      pathname.startsWith("/portal") ||
      pathname.startsWith("/client") ||
      pathname.startsWith("/laltin") ||
      pathname.startsWith("/pizzaslice");

    if (isAppSurface) {
      markSplashDone();
      return;
    }

    if (attemptedRef.current) {
      return;
    }

    let alreadyShownThisSession = false;
    try {
      alreadyShownThisSession = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
    } catch {
      alreadyShownThisSession = false;
    }

    if (alreadyShownThisSession) {
      attemptedRef.current = true;
      markSplashDone();
      return;
    }

    attemptedRef.current = true;
    shownPathRef.current = pathname;
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // Ignore storage failures and rely on in-memory attemptedRef fallback.
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      markSplashDone();
    }

    setVisible(true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    dismissDurationRef.current = reduceMotion ? 700 : SPLASH_DURATION_MS;
    armDismissTimer();

    return () => {
      clearDismissTimer();
      unlockScroll();
    };
  }, [armDismissTimer, clearDismissTimer, pathname, unlockScroll]);

  useEffect(() => {
    if (!visible || !shownPathRef.current) {
      return;
    }
    if (pathname !== shownPathRef.current) {
      beginExit();
    }
  }, [beginExit, pathname, visible]);

  useEffect(() => {
    return () => {
      clearDismissTimer();
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
      stopAudio();
      unlockScroll();
      markSplashDone();
    };
  }, [clearDismissTimer, stopAudio, unlockScroll]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={exiting ? `${styles.splashRoot} ${styles.exiting}` : styles.splashRoot}
      role="status"
      aria-live="polite"
      aria-label="Loading echo11"
    >
      <canvas id="canv" ref={canvasRef} className={styles.canvas} />
      <audio ref={audioRef} src="/echo11-splash-audio.mp3" preload="auto" playsInline />
      <div className={styles.brandBlock} aria-hidden="true">
        <div className={styles.brandLayer}>
          {"echo11".split("").map((char, index) => (
            <span key={`${char}-${index}`} className={styles.brandChar} style={{ animationDelay: `${index * 90}ms` }}>
              {char}
            </span>
          ))}
        </div>
        <p className={styles.brandSub}>website strategy, design &amp; engineering</p>
      </div>
      {!soundEnabled && (
        <button
          type="button"
          className={styles.centerHint}
          aria-label="Enable splash audio"
          onClick={() => void enableSound()}
        >
          <span className={styles.centerHintRing} />
          <span className={styles.centerHintRing} />
          <span className={styles.centerHintCursor}>
            <MousePointer2 size={20} />
          </span>
        </button>
      )}
    </div>
  );
}
