"use client";

import { useId } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, amount: 0.25 };

/** A signal taking shape. The meridians draw once, then settle. */
function SignalSculpture() {
  const reduce = useReducedMotion();
  const glowId = useId();

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 480 480"
      className="h-full w-full"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#00E5FF" stopOpacity="0.09" />
          <stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="240" cy="240" r="230" fill={`url(#${glowId})`} />
      <g transform="rotate(-28 240 240)" fill="none" strokeWidth="0.8">
        {Array.from({ length: 18 }, (_, index) => (
          <motion.ellipse
            key={index}
            cx="240"
            cy="240"
            rx={12 + index * 10}
            ry="182"
            stroke={index % 5 === 0 ? "#00E5FF" : "#fcfcfc"}
            strokeOpacity={index % 5 === 0 ? 0.55 : 0.18}
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: { pathLength: 1, opacity: 1 },
            }}
            transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : index * 0.035, ease: EASE }}
          />
        ))}
        <motion.path
          d="M 58 240 H 422"
          stroke="#00E5FF"
          strokeOpacity="0.65"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: reduce ? 0 : 1.4, ease: EASE }}
        />
      </g>
      <circle cx="240" cy="240" r="3" fill="#00E5FF" />
    </motion.svg>
  );
}

export function CTABanner() {
  const reduce = useReducedMotion();
  const entrance = reduce ? false : { opacity: 0, y: 18 };

  return (
    <section aria-labelledby="homepage-invitation" className="relative overflow-hidden bg-background pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-32">
      <Container>
        <motion.div
          aria-hidden="true"
          className="h-px origin-left bg-accent/30"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
        />

        <div className="mt-7 flex items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 sm:mt-9">
          <span>Begin a conversation</span>
          <span className="hidden sm:block">Your ambition. Our craft.</span>
        </div>

        <div className="relative mt-12 grid items-center gap-12 sm:mt-16 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
          <div className="relative z-10 min-w-0">
            <div id="homepage-invitation">
              <RevealText
                as="h2"
                text="Your next chapter."
                trigger="view"
                blur={5}
                className="max-w-[12ch] font-sans text-[clamp(3rem,6.6vw,6.3rem)] font-bold leading-[0.98] tracking-[-0.055em] text-foreground"
              />
              <RevealText
                as="p"
                text="Built together."
                trigger="view"
                blur={5}
                className="mt-3 font-sans text-[clamp(2.65rem,5.8vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.055em] text-accent"
              />
            </div>

            <motion.div
              initial={entrance}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="mt-8 sm:mt-10"
            >
              <p className="max-w-[42ch] text-pretty font-sans text-base leading-[1.75] text-white/60 sm:text-[17px]">
                A new business. A bigger ambition. A website you’ve outgrown. Tell us where you want to go — we’ll help shape the way forward.
              </p>
              <Button asChild size="lg" className="mt-8 h-14 gap-8 px-7 font-mono text-xs shadow-none sm:mt-10">
                <Link href="/contact" className="group">
                  Start a project
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                </Link>
              </Button>
              <p className="mt-5 max-w-[40ch] text-pretty font-mono text-[10px] leading-5 text-white/45">
                Share your goals. We’ll review your inquiry and reply with the next step.
              </p>
            </motion.div>
          </div>

          <div className="mx-auto -mt-4 w-full max-w-[320px] lg:mt-0 lg:max-w-[480px]">
            <SignalSculpture />
            <p className="-mt-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
              An idea becomes a signal.
            </p>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/40 sm:mt-16 lg:mt-20"
        >
          <span>Strategy · Design · Development</span>
          <span>Echo11 / Website studio</span>
        </motion.div>
      </Container>
    </section>
  );
}
