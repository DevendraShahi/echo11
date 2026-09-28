"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import DisplayCards from "@/components/ui/display-cards";
import { MonitorSmartphone, LayoutTemplate, ShieldCheck } from "lucide-react";
import {
  createFloatAnimation,
  createRevealUp,
  viewportOnce,
} from "@/lib/animations";

const trustSignals = [
  {
    title: "What we build",
    body: "Marketing websites, e-commerce experiences, publishing platforms, portals, and early product systems.",
    icon: <MonitorSmartphone className="size-4 text-[#00E5FF]" />,
  },
  {
    title: "How we work",
    body: "Strategy, UX, interface design, and engineering stay connected through one practical delivery process.",
    icon: <LayoutTemplate className="size-4 text-[#00E5FF]" />,
  },
  {
    title: "Why it matters",
    body: "Clear scope, credible presentation, stable releases, and maintainable systems after launch.",
    icon: <ShieldCheck className="size-4 text-[#00E5FF]" />,
  },
];

export function TrustSnapshot() {
  const prefersReducedMotion = useReducedMotion();
  const introVariants = createRevealUp(20, 0.55);
  const cardsContainer = createRevealUp(28, 0.55);

  const displayCardsData = trustSignals.map((item, index) => {
    let className = "";
    if (index === 0) {
      className = "[grid-area:stack] hover:-translate-y-24 md:hover:-translate-y-32 before:absolute before:w-[100%] before:outline-1 before:rounded-none before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0";
    } else if (index === 1) {
      className = "[grid-area:stack] translate-x-8 translate-y-8 md:translate-x-12 md:translate-y-10 hover:-translate-y-10 md:hover:-translate-y-12 before:absolute before:w-[100%] before:outline-1 before:rounded-none before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0";
    } else {
      className = "[grid-area:stack] translate-x-16 translate-y-16 md:translate-x-24 md:translate-y-20 hover:translate-y-12 md:hover:translate-y-12";
    }

    return {
      icon: item.icon,
      title: item.title,
      description: item.body,
      date: "",
      iconClassName: "text-[#00E5FF]",
      titleClassName: "text-white",
      className,
    };
  });

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-black py-24 md:py-32">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent"
        animate={createFloatAnimation(prefersReducedMotion, 10)}
        transition={{ duration: 8, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-12rem] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-accent/8 blur-[140px]"
        animate={createFloatAnimation(prefersReducedMotion, 16)}
        transition={{ duration: 9, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />

      <Container>
        <div className="grid grid-cols-1 items-center gap-16 md:gap-24 lg:grid-cols-2">
          <motion.div
            variants={introVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              Product engineering studio
            </p>
            <h2 className="max-w-xl font-sans text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Built for teams that need a serious digital product partner.
            </h2>
          </motion.div>

          <motion.div
            variants={cardsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex justify-center lg:justify-end py-12 md:py-16"
          >
            <DisplayCards cards={displayCardsData} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}