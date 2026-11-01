"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type Lenis from "lenis";

import { EchoField } from "@/components/ui/EchoField";
import { RevealText } from "@/components/ui/RevealText";
import { isSplashDone, onSplashDone } from "@/lib/splash";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPLASH_SAFETY_MS = 3000;

const SERVICES = [
  { index: "01", label: "Strategy" },
  { index: "02", label: "Design" },
  { index: "03", label: "Build" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState<boolean>(() => isSplashDone());

  // The giant wordmark's span. The field measures it and masks itself to its
  // glyphs, so the word is built from live signal.
  const wordRef = useRef<HTMLSpanElement>(null);
  const [fieldReady, setFieldReady] = useState(false);
  const [actionFocused, setActionFocused] = useState(false);
  const handleFieldReady = useCallback(() => setFieldReady(true), []);
  const handleActionFocus = (event: FocusEvent<HTMLDivElement>) => {
    setActionFocused(true);
    // A sticky action can be inside the viewport but underneath the following
    // content plane. Return keyboard users to the stage before they activate it.
    if (reduceMotion || window.innerHeight <= 620 || !event.target.matches(":focus-visible") || !ref.current) return;
    const top = window.scrollY + ref.current.getBoundingClientRect().top;
    if (window.scrollY <= top) return;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: "instant" });
  };

  useEffect(() => {
    if (revealed) {
      return;
    }
    const unsubscribe = onSplashDone(() => {
      setRevealed(true);
    });
    const safety = window.setTimeout(() => {
      setRevealed(true);
    }, SPLASH_SAFETY_MS);
    return () => {
      unsubscribe();
      window.clearTimeout(safety);
    };
  }, [revealed]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.6], [1, 1, reduceMotion ? 1 : 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], ["0%", reduceMotion ? "0%" : "-3%"]);

  const riseHidden = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };
  const riseShown = { opacity: 1, y: 0 };

  return (
    <section ref={ref} aria-label="Introduction" className="home-hero relative h-[160svh]">
      <div className="home-hero-stage sticky top-0 h-[100svh] overflow-hidden">
        {/* Signal layer: the field is masked to the wordmark, with a faint
            pass escaping the letters across the stage. Both layers share the
            scroll transform so the canvas tracks the DOM wordmark exactly. */}
        <motion.div style={{ opacity: actionFocused ? 1 : opacity, y: actionFocused ? 0 : y }} className="home-hero-visual absolute inset-0 z-0">
          <EchoField active={revealed} anchorRef={wordRef} progress={scrollYProgress} onReady={handleFieldReady} />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.55)_50%,transparent_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
            aria-hidden="true"
          />
        </motion.div>

        {/* Content plane: everything non-interactive lets clicks through to
            the field, so the open stage answers back. */}
        <motion.div
          style={{ opacity: actionFocused ? 1 : opacity, y: actionFocused ? 0 : y }}
          onFocusCapture={handleActionFocus}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActionFocused(false); }}
          className="home-hero-content pointer-events-none absolute inset-0 z-10 flex flex-col"
        >
          {/* Meta rail */}
          <motion.div
            initial={riseHidden}
            animate={revealed ? riseShown : riseHidden}
            transition={{ duration: 0.7, ease: EASE, delay: revealed ? 0.3 : 0 }}
            className="border-b border-white/10 pt-16 lg:pt-[76px]"
          >
            <Container className="flex items-center justify-between gap-4 pb-3 font-mono text-[10px] uppercase tracking-[0.28em]">
              <span className="text-white/70">echo11</span>
              <span className="hidden text-white/60 sm:block">
                Strategy · Design · Build
              </span>
            </Container>
          </motion.div>

          {/* Statement */}
          <div className="flex min-h-0 flex-1 items-center">
            <Container>
              <h1 aria-label="Make your brand echo." className="font-sans">
                <RevealText
                  text="Make your brand"
                  trigger="load"
                  when={revealed}
                  delay={0.06}
                  stagger={0.065}
                  className="block text-[clamp(1.7rem,3.6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white/85"
                />
                {/* Transparent: the canvas below draws the visible glyphs. */}
                <span
                  ref={wordRef}
                  className={`block select-none text-[min(28vw,38svh)] font-bold leading-[0.92] tracking-[-0.04em] ${fieldReady ? "text-transparent" : "text-accent"}`}
                >
                  echo.
                </span>
              </h1>

              <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <motion.p
                  initial={riseHidden}
                  animate={revealed ? riseShown : riseHidden}
                  transition={{ duration: 0.7, ease: EASE, delay: revealed ? 0.62 : 0 }}
                  className="pointer-events-auto max-w-[46ch] text-pretty font-sans text-base leading-[1.65] text-white/70 sm:text-[18px]"
                >
                  We plan, design, and build websites for businesses that need a clearer offer
                  and an easier path to inquiry or purchase.
                </motion.p>

                <motion.div
                  initial={riseHidden}
                  animate={revealed ? riseShown : riseHidden}
                  transition={{ duration: 0.7, ease: EASE, delay: revealed ? 0.74 : 0 }}
                  className="pointer-events-auto flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end"
                >
                  <Button asChild size="lg" className="h-12 px-7 text-[13px] tracking-[0.02em]">
                    <Link href="/contact">Discuss your website</Link>
                  </Button>

                  <Link
                    href="/work"
                    className="group inline-flex min-h-11 items-center gap-2 font-sans text-[14px] text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <span className="border-b border-white/25 pb-0.5 transition-colors group-hover:border-white/60">
                      Explore our work
                    </span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </Container>
          </div>

          {/* Services rail: real index where decorative readouts usually sit. */}
          <motion.div
            initial={riseHidden}
            animate={revealed ? riseShown : riseHidden}
            transition={{ duration: 0.7, ease: EASE, delay: revealed ? 0.9 : 0 }}
            className="border-t border-white/10"
          >
            <Container>
              <ul className="grid grid-cols-3 divide-x divide-white/10 font-mono text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.26em]">
                {SERVICES.map((service) => (
                  <li
                    key={service.index}
                    className="flex items-baseline gap-2 py-4 pl-3 first:pl-0 sm:gap-3 sm:pl-6"
                  >
                    <span className="text-accent/70">{service.index}</span>
                    <span className="text-white/65">{service.label}</span>
                  </li>
                ))}
              </ul>
            </Container>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
