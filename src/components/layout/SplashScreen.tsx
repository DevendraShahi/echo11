"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MousePointer2 } from "lucide-react";
import styles from "./SplashScreen.module.css";

const SPLASH_DURATION_MS = 3900;
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
  const [audioBlocked, setAudioBlocked] = useState(false);
  const attemptedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const dismissDurationRef = useRef<number>(SPLASH_DURATION_MS);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockHandlerRef = useRef<(() => void) | null>(null);

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
    audio.muted = false;
    setAudioBlocked(false);
  }, []);

  const clearDismissTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const armDismissTimer = useCallback(() => {
    if (timeoutRef.current) {
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setVisible(false);
      stopAudio();
      unlockScroll();
    }, dismissDurationRef.current);
  }, [stopAudio, unlockScroll]);

  const removeAudioUnlockListeners = useCallback(() => {
    const handler = audioUnlockHandlerRef.current;
    if (!handler) {
      return;
    }
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
    window.removeEventListener("touchstart", handler);
    audioUnlockHandlerRef.current = null;
  }, []);

  const tryPlayAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }

    // Skip if already playing.
    if (!audio.paused) {
      setAudioBlocked(false);
      armDismissTimer();
      return true;
    }

    try {
      audio.currentTime = 0;
      audio.muted = false;
      audio.volume = 1;
      await audio.play();
      setAudioBlocked(false);
      armDismissTimer();
      return true;
    } catch {
      // Fallback attempt: start muted, then unmute shortly after.
      try {
        audio.currentTime = 0;
        audio.muted = true;
        await audio.play();
        window.setTimeout(() => {
          const current = audioRef.current;
          if (!current) {
            return;
          }
          current.muted = false;
          current.volume = 1;
        }, 120);
        setAudioBlocked(false);
        armDismissTimer();
        return true;
      } catch {
        setAudioBlocked(true);
        return false;
      }
    }
  }, [armDismissTimer]);

  const enableAudio = useCallback(async () => {
    const played = await tryPlayAudio();
    if (played) {
      removeAudioUnlockListeners();
    }
  }, [removeAudioUnlockListeners, tryPlayAudio]);

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
    if (!visible) {
      return;
    }

    let canceled = false;

    const bootAudio = async () => {
      const played = await tryPlayAudio();
      if (played || canceled) {
        return;
      }

      const unlockHandler = () => {
        void enableAudio();
      };
      audioUnlockHandlerRef.current = unlockHandler;
      window.addEventListener("pointerdown", unlockHandler);
      window.addEventListener("keydown", unlockHandler);
      window.addEventListener("touchstart", unlockHandler);
    };

    void bootAudio();

    return () => {
      canceled = true;
      stopAudio();
      removeAudioUnlockListeners();
    };
  }, [enableAudio, removeAudioUnlockListeners, stopAudio, tryPlayAudio, visible]);

  useEffect(() => {
    const isAppSurface = pathname.startsWith("/lab") || pathname.startsWith("/portal");

    if (attemptedRef.current || isAppSurface) {
      return;
    }

    attemptedRef.current = true;

    setVisible(true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dismissDurationRef.current = reduceMotion ? 700 : SPLASH_DURATION_MS;

    return () => {
      clearDismissTimer();
      unlockScroll();
    };
  }, [clearDismissTimer, pathname, unlockScroll]);

  useEffect(() => {
    return () => {
      clearDismissTimer();
      stopAudio();
      removeAudioUnlockListeners();
      unlockScroll();
    };
  }, [clearDismissTimer, removeAudioUnlockListeners, stopAudio, unlockScroll]);

  const onSplashInteraction = useCallback(() => {
    if (!audioBlocked) {
      return;
    }
    void enableAudio();
  }, [audioBlocked, enableAudio]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.splashRoot} ${audioBlocked ? styles.audioInteractive : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading echo11"
      tabIndex={audioBlocked ? 0 : -1}
      onPointerDown={onSplashInteraction}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && audioBlocked) {
          event.preventDefault();
          onSplashInteraction();
        }
      }}
    >
      <canvas id="canv" ref={canvasRef} className={styles.canvas} />
      <audio ref={audioRef} src="/echo11-splash-audio.mp3" preload="auto" autoPlay playsInline />
      <div className={styles.brandBlock} aria-hidden="true">
        <div className={styles.brandLayer}>
          {"echo11".split("").map((char, index) => (
            <span key={`${char}-${index}`} className={styles.brandChar} style={{ animationDelay: `${index * 90}ms` }}>
              {char}
            </span>
          ))}
        </div>
        <p className={styles.brandSub}>product engineering studio</p>
      </div>
      {audioBlocked && (
        <button
          type="button"
          className={styles.centerHint}
          aria-label="Enable splash audio"
          onClick={() => void enableAudio()}
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
