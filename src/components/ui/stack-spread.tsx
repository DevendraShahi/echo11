"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { caseStudies } from "@/data/caseStudies";

export interface StackSpreadItem {
  src: string;
  alt?: string;
}

export interface StackSpreadTarget {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface StackSpreadCard {
  item: StackSpreadItem;
  target: StackSpreadTarget;
  /** Final x/y positions (vw/vh) for touch layouts. */
  targetSm?: { x: number; y: number };
  /** Rotation while the cards are stacked. */
  stackRotate?: number;
  /** Initial offset while the cards are stacked (vw/vh). */
  stackOffset?: { x: number; y: number };
  /** Paint order; higher values sit on top. */
  z?: number;
}

interface CardLayout extends Omit<StackSpreadCard, "item"> {
  projectId: string;
}

const CARD_LAYOUT: CardLayout[] = [
  {
    projectId: "siyo-dhaago",
    stackOffset: { x: -8, y: -7 },
    stackRotate: -16,
    target: { x: -22, y: -35, rotate: -2, scale: 0.86, w: 17, h: 22 },
    targetSm: { x: -24, y: -38 },
    z: 2,
  },
  {
    projectId: "leaders",
    stackOffset: { x: 8, y: -9 },
    stackRotate: 15,
    target: { x: 34, y: -33, rotate: 2, scale: 0.84, w: 18, h: 30 },
    targetSm: { x: 24, y: -38 },
    z: 3,
  },
  {
    projectId: "ivision",
    stackOffset: { x: -12, y: -2 },
    stackRotate: -5,
    target: { x: -38, y: -2, rotate: 1, scale: 0.88, w: 16, h: 30 },
    targetSm: { x: -24, y: -18 },
    z: 4,
  },
  {
    projectId: "fluids",
    stackOffset: { x: 2, y: -8 },
    stackRotate: -2,
    target: { x: 7, y: -31, rotate: -1, scale: 0.86, w: 25, h: 30 },
    targetSm: { x: 24, y: -18 },
    z: 5,
  },
  {
    projectId: "curriculumos",
    stackOffset: { x: 12, y: 1 },
    stackRotate: 7,
    target: { x: 39, y: 6, rotate: -1, scale: 0.82, w: 18, h: 30 },
    targetSm: { x: -24, y: 19 },
    z: 6,
  },
  {
    projectId: "jayvis",
    stackOffset: { x: -5, y: 8 },
    stackRotate: 6,
    target: { x: -25, y: 34, rotate: 1, scale: 0.86, w: 22, h: 25 },
    targetSm: { x: 24, y: 19 },
    z: 7,
  },
  {
    projectId: "trueluxe",
    stackOffset: { x: 5, y: 6 },
    stackRotate: 3,
    target: { x: 2, y: 37, rotate: 0, scale: 0.84, w: 20, h: 26 },
    targetSm: { x: -24, y: 38 },
    z: 8,
  },
  {
    projectId: "laltin",
    stackOffset: { x: 12, y: 10 },
    stackRotate: -7,
    target: { x: 30, y: 35, rotate: 2, scale: 0.86, w: 16, h: 20 },
    targetSm: { x: 24, y: 38 },
    z: 9,
  },
];

const CARDS: StackSpreadCard[] = CARD_LAYOUT.flatMap(({ projectId, ...layout }) => {
  const project = caseStudies.find((item) => item.id === projectId);
  return project
    ? [{
        ...layout,
        item: {
          src: project.thumbnail,
          alt: `${project.title} ${project.kind === "concept" ? "brand concept" : "project"} image`,
        },
      }]
    : [];
});

const SCATTER_START = 0.02;
const SCATTER_END = 0.82;
const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };

const RESPONSIVE = {
  desktop: {
    scale: null as number | null,
    small: false,
    colX: null as number | null,
    card: null as { w: number; h: number } | null,
  },
  small: {
    scale: 0.76,
    small: true,
    colX: 24,
    card: { w: 38, h: 13 },
  },
};

function useResponsive() {
  const [responsive, setResponsive] = useState(RESPONSIVE.desktop);

  useEffect(() => {
    const pointer = window.matchMedia("(max-width: 767px)");
    const update = () => setResponsive(pointer.matches ? RESPONSIVE.small : RESPONSIVE.desktop);
    update();
    pointer.addEventListener("change", update);
    return () => pointer.removeEventListener("change", update);
  }, []);

  return responsive;
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, PARALLAX_SPRING);
  const y = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (!enabled) return;

    if (!active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

function parallaxDepth(index: number, total: number) {
  return total <= 1 ? 1 : 0.55 + (index / (total - 1)) * 0.75;
}

function SpreadCard({
  card,
  progress,
  reduce,
  clusterRotation,
  scaleMul,
  isSmall,
  colX,
  fixedCard,
  stackScale,
  cardRadius,
  pointer,
  depth,
}: {
  card: StackSpreadCard;
  progress: MotionValue<number>;
  reduce: boolean;
  clusterRotation: boolean;
  scaleMul: number | null;
  isSmall: boolean;
  colX: number | null;
  fixedCard: { w: number; h: number } | null;
  stackScale: number;
  cardRadius: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  depth: number;
}) {
  const { item, target } = card;
  const stackOffset = card.stackOffset ?? { x: 0, y: 0 };
  const smallTarget = isSmall ? card.targetSm : undefined;
  const endX = smallTarget
    ? colX !== null
      ? Math.sign(smallTarget.x) * colX
      : smallTarget.x
    : target.x;
  const endY = smallTarget ? smallTarget.y : target.y;
  const restScale = scaleMul ?? target.scale ?? 1;
  const stackRotate = reduce || !clusterRotation ? 0 : card.stackRotate ?? 0;
  const endRotate = reduce || isSmall ? 0 : target.rotate;

  const translate = useTransform(
    [progress, pointer.x, pointer.y],
    ([amount, pointerX, pointerY]: number[]) => {
      const x = stackOffset.x + (endX - stackOffset.x) * amount;
      const y = stackOffset.y + (endY - stackOffset.y) * amount;
      const drift = depth * amount;
      const offsetX = x - pointerX * PARALLAX_X * drift;
      const offsetY = y - pointerY * PARALLAX_Y * drift;
      return `calc(-50% + ${offsetX}vw) calc(-50% + ${offsetY}svh)`;
    },
  );
  const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
  const scale = useTransform(progress, [0, 1], [stackScale, restScale]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}svh`,
        zIndex: card.z ?? 1,
        translate,
        rotate,
        scale,
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden border border-white/15 bg-[#070a0b]"
        style={{ borderRadius: `${cardRadius}px` }}
      >
        <Image
          src={item.src}
          alt={item.alt ?? ""}
          fill
          sizes="(max-width: 768px) 38vw, 25vw"
          draggable={false}
          className="object-cover motion-safe:animate-[work-image-in_700ms_ease-out_both]"
        />
      </div>
    </motion.div>
  );
}

export interface StackSpreadProps {
  /** Scroll distance while the images spread, in viewport heights. */
  scrollLength?: number;
  bgColor?: string;
  /** Fan the clustered stack or start flat. */
  clusterRotation?: boolean;
  /** Scale of the cards while clustered. */
  stackScale?: number;
  /** Card corner radius in pixels. */
  cardRadius?: number;
  /** Scroll progress (0–1) where the centre copy starts fading in. */
  textFadeStart?: number;
  showScrollHint?: boolean;
  cards?: StackSpreadCard[];
}

export default function StackSpread({
  scrollLength = 160,
  bgColor = "transparent",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 4,
  textFadeStart = 0.3,
  showScrollHint = true,
  cards = CARDS,
}: StackSpreadProps) {
  const stageRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() === true;
  const { scale: scaleMul, small: isSmall, colX, card: fixedCard } = useResponsive();
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const mapScrollProgress = useCallback(
    (value: number) =>
      reduce
        ? 1
        : Math.max(0, Math.min(1, (value - SCATTER_START) / (SCATTER_END - SCATTER_START))),
    [reduce],
  );
  const progress = useTransform(scrollYProgress, mapScrollProgress);
  const [isSpread, setIsSpread] = useState(false);
  const updateSpread = useCallback((value: number) => {
    setIsSpread((wasSpread) => (wasSpread ? value > 0.985 : value >= 0.999));
  }, []);
  useMotionValueEvent(progress, "change", updateSpread);
  const parallaxEnabled = !reduce && !isSmall;
  const pointer = usePointerParallax(isSpread, parallaxEnabled);
  const copyOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.35], [0, 1]);
  const copyScale = useTransform(progress, [textFadeStart, 0.9], [0.88, 1]);
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0]);

  return (
    <section
      ref={stageRef}
      aria-label="A spread of Echo11 projects"
      className="relative w-full"
      style={{
        height: reduce ? "100svh" : `${Math.max(120, scrollLength)}svh`,
        minHeight: reduce ? "40rem" : undefined,
        backgroundColor: bgColor,
      }}
    >
      <div className={reduce ? "relative h-full w-full overflow-hidden" : "sticky top-0 h-[100svh] w-full overflow-hidden"}>
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: reduce ? 1 : copyOpacity, scale: reduce ? 1 : copyScale }}
        >
          <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-accent sm:text-[10px]">
            Echo11 <span className="px-2 text-white/25">/</span> brand & website studio
          </p>
          <h2 className="max-w-[15ch] whitespace-pre-line font-sans text-[clamp(1.4rem,3.4vw,3.25rem)] font-bold leading-[1] tracking-[-0.04em] text-white">
            Different briefs.
            <span className="block text-white/65">Different responses.</span>
          </h2>
          <p className="mt-4 max-w-[30ch] text-pretty font-sans text-xs leading-5 text-white/65 sm:text-base sm:leading-7">
            Browse the projects below to see the audience, challenge, and contribution behind each response.
          </p>
        </motion.div>

        <div className="absolute inset-0 z-10" role="group" aria-label="Project images">
          {cards.map((card, index) => (
            <SpreadCard
              key={`${card.item.src}-${index}`}
              card={card}
              progress={progress}
              reduce={reduce}
              clusterRotation={clusterRotation}
              scaleMul={scaleMul}
              isSmall={isSmall}
              colX={colX}
              fixedCard={fixedCard}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              depth={parallaxEnabled ? parallaxDepth(index, cards.length) : 0}
            />
          ))}
        </div>

        {showScrollHint && !reduce && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/55 sm:bottom-8 sm:text-[10px]"
            style={{ opacity: hintOpacity }}
            aria-hidden="true"
          >
            <span>Scroll to explore</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="motion-safe:animate-bounce"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  );
}
