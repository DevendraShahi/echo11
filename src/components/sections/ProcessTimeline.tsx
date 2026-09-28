"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";

type EngineStep = {
  num: string;
  title: string;
  desc: string;
  specs: string[];
  media: {
    poster: string;
    video: string;
    alt: string;
  };
};

function EngineMediaVisual({ step }: { step: EngineStep }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#030303]">
      <video
        aria-label={step.media.alt}
        autoPlay
        className="absolute inset-0 z-10 h-full w-full object-cover opacity-85 saturate-[0.92]"
        loop
        muted
        playsInline
        poster={step.media.poster}
        preload="auto"
      >
        <source src={step.media.video} type="video/mp4" />
      </video>
      <Image
        alt={step.media.alt}
        className="object-cover opacity-70"
        fill
        sizes="(min-width: 1024px) 560px, 100vw"
        src={step.media.poster}
      />
      <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.22)_58%,rgba(0,0,0,0.64))]" />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_42%,rgba(0,229,255,0.12),transparent_45%)] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 z-20 border border-white/[0.06]" />
    </div>
  );
}

export const steps: EngineStep[] = [
  { 
    num: "01", 
    title: "Discovery & Architecture", 
    desc: "We align on outcomes, user intent, and product constraints, then translate that into a clear technical blueprint before development starts.",
    specs: ["Product Scope", "System Blueprint", "Data Model"],
    media: {
      poster: "/engine/%20Discovery%20%26%20Architecture2.png",
      video: "/engine/%20Discovery%20%26%20Architecture2.mp4",
      alt: "Discovery and architecture visual for product planning and system blueprinting",
    },
  },
  { 
    num: "02", 
    title: "Design & Interaction", 
    desc: "We shape interface direction, interaction patterns, and component language so the product feels precise, branded, and easy to use.",
    specs: ["Interface Direction", "Component System", "Motion Rules"],
    media: {
      poster: "/engine/Design%20%26%20Interaction2.png",
      video: "/engine/Design%20%26%20Interaction2.mp4",
      alt: "Design and interaction visual for interface direction and motion systems",
    },
  },
  { 
    num: "03", 
    title: "Product Engineering", 
    desc: "We build clean, testable systems with dependable release practices, balancing delivery speed with long-term maintainability.",
    specs: ["Typed Codebase", "Reliable Delivery", "Quality Gates"],
    media: {
      poster: "/engine/Product%20Engineering2.png",
      video: "/engine/Product%20Engineering2.mp4",
      alt: "Product engineering visual for code quality, delivery systems, and technical execution",
    },
  },
  { 
    num: "04", 
    title: "Launch & Scale", 
    desc: "We launch with confidence, monitor performance continuously, and iterate based on real user behavior and business feedback.",
    specs: ["Production Rollout", "Observability", "Iteration Loop"],
    media: {
      poster: "/engine/Launch%20%26%20Scale2.png",
      video: "/engine/Launch%20%26%20Scale2.mp4",
      alt: "Launch and scale visual for production rollout, monitoring, and growth iteration",
    },
  },
];

function ArchStepInfo({
  step,
  index,
  onActive,
}: {
  step: typeof steps[0];
  index: number;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-38% 0px -38% 0px", once: false });

  useEffect(() => {
    if (isInView) {
      onActive(index);
    }
  }, [index, isInView, onActive]);

  return (
    <div
      ref={ref}
      className="grid min-h-[82vh] items-center py-12 md:min-h-screen md:py-16"
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isInView ? 1 : 0.34,
          y: isInView ? 0 : 18,
        }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl"
      >
        <div className="mb-6 flex items-center gap-5">
          <span className="font-mono text-2xl tracking-widest text-accent md:text-3xl">
            {step.num}
          </span>
          <span className="h-px w-16 bg-white/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
            Phase {index + 1}
          </span>
        </div>
        <h3 className="mb-6 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
          {step.title}
        </h3>
        <p className="mb-8 max-w-lg font-mono text-base leading-relaxed text-white/52 md:text-lg">
          {step.desc}
        </p>
        <div className="flex flex-wrap gap-3">
          {step.specs.map((spec) => (
            <span
              key={spec}
              className="border border-white/5 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-accent md:text-xs"
            >
              [{spec}]
            </span>
          ))}
        </div>

        <div className="mt-10 lg:hidden">
          <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden border border-white/10 bg-[#030303]">
            <EngineMediaVisual step={step} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type PinState = {
  mode: "absolute" | "fixed";
  top: number;
  left: number;
  width: number;
};

function ArchVisualStack({ activeStep }: { activeStep: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [pinState, setPinState] = useState<PinState>({
    mode: "absolute",
    top: 0,
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;

    const updatePinState = () => {
      frame = 0;

      if (!window.matchMedia("(min-width: 1024px)").matches) {
        return;
      }

      const railRect = rail.getBoundingClientRect();
      const pinTop = Math.round(window.innerHeight * 0.14);
      const shellHeight = Math.max(Math.round(window.innerHeight * 0.72), 520);
      const pinLimit = railRect.bottom - shellHeight;

      const nextState: PinState =
        railRect.top > pinTop
          ? {
              mode: "absolute",
              top: 0,
              left: 0,
              width: railRect.width,
            }
          : pinLimit < pinTop
            ? {
                mode: "absolute",
                top: Math.max(0, railRect.height - shellHeight),
                left: 0,
                width: railRect.width,
              }
            : {
                mode: "fixed",
                top: pinTop,
                left: railRect.left,
                width: railRect.width,
              };

      setPinState((current) =>
        current.mode === nextState.mode &&
        current.top === nextState.top &&
        current.left === nextState.left &&
        current.width === nextState.width
          ? current
          : nextState
      );
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePinState);
    };

    updatePinState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const shellStyle: CSSProperties =
    pinState.mode === "fixed"
      ? {
          left: pinState.left,
          position: "fixed",
          top: pinState.top,
          width: pinState.width,
        }
      : {
          left: 0,
          position: "absolute",
          top: pinState.top,
          width: "100%",
        };

  return (
    <div ref={railRef} className="relative hidden min-h-full lg:block">
      <div
        className="z-20 flex h-[72vh] min-h-[520px] items-center"
        style={shellStyle}
      >
        <div className="relative h-[440px] w-full max-w-[560px]">
          {steps.map((step, index) => {
            const isPast = index < activeStep;
            const isActive = index === activeStep;

            return (
              <motion.div
                key={step.num}
                className="absolute left-0 top-1/2 h-[420px] w-full -translate-y-1/2 overflow-hidden border border-white/10 bg-[#030303] shadow-[0_30px_100px_rgba(0,0,0,0.38)]"
                style={{ zIndex: steps.length - index }}
                initial={false}
                animate={{
                  clipPath: isPast ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)",
                  opacity: isPast ? 0.92 : 1,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    y: isPast ? "-18%" : isActive ? "0%" : "8%",
                    scale: isActive ? 1 : 1.025,
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent/[0.06] via-black/0 to-transparent" />
                  <div className="absolute inset-0">
                    <EngineMediaVisual step={step} />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProcessTimeline({ standalone = false }: { standalone?: boolean } = {}) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className={`relative overflow-visible ${standalone ? 'py-16' : 'py-12 md:py-32 bg-black border-y border-white/5'}`}>
      <Container>
        {/* Simplified Header Segment */}
        <div className="mb-12 border-b border-white/5 pb-12 md:mb-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-sans text-foreground mb-6 tracking-tight">
              The <span className="text-accent text-glow">Engine.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono leading-relaxed">
              A structured delivery system that keeps strategy, design, and engineering aligned from kickoff to scale.
            </p>
          </div>
        </div>

        {/* Pinned-mask reveal inspired by the supplied arch reference. */}
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(300px,0.95fr)_minmax(420px,1.05fr)] lg:gap-16 xl:gap-24">
          <div>
            {steps.map((step, index) => (
              <ArchStepInfo
                key={step.num}
                step={step}
                index={index}
                onActive={setActiveStep}
              />
            ))}
          </div>
          <ArchVisualStack activeStep={activeStep} />
        </div>
      </Container>
    </section>
  );
}
