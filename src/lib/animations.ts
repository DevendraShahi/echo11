import { Variants } from "framer-motion";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const viewportOnce = { once: true, margin: "-100px" } as const;

export function createFadeIn(duration = 0.5): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration, ease: EASE_OUT },
    },
  };
}

export function createRevealUp(distance = 24, duration = 0.6): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: EASE_OUT },
    },
  };
}

export function createStagger(staggerChildren = 0.1, delayChildren = 0): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

export function createScaleIn(scale = 0.96, duration = 0.55): Variants {
  return {
    hidden: { opacity: 0, scale },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration, ease: EASE_OUT },
    },
  };
}

export function createFloatAnimation(reducedMotion: boolean | null | undefined, distance = 8) {
  return reducedMotion ? { y: 0 } : { y: [0, -distance, 0] };
}

export function createPulseAnimation(reducedMotion: boolean | null | undefined, min = 0.72, max = 1) {
  return reducedMotion ? { opacity: max } : { opacity: [min, max, min] };
}

export function createSweepAnimation(
  reducedMotion: boolean | null | undefined,
  from: string | number = "-100%",
  to: string | number = "200%"
) {
  return reducedMotion ? { x: "0%" } : { x: [from, to] };
}
