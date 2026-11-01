"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared telemetry kicker — mono, wide-tracked, accent when live. */
export const HERO_KICKER = "font-mono text-[10px] uppercase tracking-[0.28em]";
export const HERO_META = "font-mono text-[10px] uppercase tracking-[0.2em] text-white/50";

export interface PageHeroAction {
  /** Rendered as the node itself — wrap Links in Button asChild or a text link. */
  node: ReactNode;
}

/**
 * Standardized secondary action link for heroes.
 * Understated, high-clarity anchor or route jump paired with an accent arrow.
 */
export function HeroSecondaryLink({
  href,
  onClick,
  children,
  icon = "up-right",
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  icon?: "up-right" | "down";
  className?: string;
}) {
  const content = (
    <>
      <span className="border-b border-white/20 pb-0.5 transition-colors group-hover:border-accent group-hover:text-accent">
        {children}
      </span>
      {icon === "down" ? (
        <ArrowDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-accent"
        />
      ) : (
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      )}
    </>
  );

  const baseClasses = cn(
    "group inline-flex min-h-12 items-center gap-2.5 font-sans text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black",
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href || "#"} className={baseClasses}>
      {content}
    </Link>
  );
}

export interface PageHeroProps {
  /** Arrangement of headline, lead and actions only; atmosphere and fixtures stay untouched. */
  copyLayout?: "stacked" | "split" | "inset" | "statement" | "compact";
  /** Left telemetry kicker, e.g. "Echo11 / Website services" */
  kickerLeft: string;
  /** Optional right status readout, e.g. "Strategy · Design · Engineering" */
  kickerRight?: string;
  /** Hide the animated signal pulse beside the left kicker. */
  hideSignal?: boolean;
  /** Primary headline. String wraps in RevealText; pass JSX for multi-line control. */
  title: ReactNode;
  /** Trailing accent word rendered in cyan when `title` is a string. */
  highlight?: string;
  /** Accessible id for the heading (also used when title is JSX). */
  titleId?: string;
  /** Extra classes on the h1 — e.g. max-w for long statements. */
  titleClassName?: string;
  /** Section id for anchors. */
  id?: string;
  /** Editorial lead. String gets the house body style. */
  description: ReactNode;
  /** Primary / secondary actions, staggered in after the lead. */
  actions?: ReactNode;
  /** Sub-hero fixture (journey, tabs, stats, card spread). */
  children?: ReactNode;
  /** Outer section classes (padding overrides, etc.). */
  className?: string;
}

function SignalPulse({ reduce }: { reduce: boolean }) {
  return (
    <span aria-hidden="true" className="relative flex h-[7px] w-[7px] shrink-0">
      <span className="absolute inset-0 rounded-full bg-accent" />
      {reduce ? null : (
        <motion.span className="absolute inset-0 rounded-full bg-accent" animate={{ scale: [1, 2.4], opacity: [0.5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
      )}
    </span>
  );
}

/**
 * Shared inner-page hero. Structure:
 *   meta rail → display title → signal hairline → lead + actions → fixture
 *
 * The signal hairline is the "transmission arriving" motif: a thin accent
 * line that draws left-to-right once on load, tying the page into the cyan
 * horizon that PageWrapper places above every studio route.
 */
export function PageHero({
  kickerLeft, kickerRight, hideSignal = false, title, highlight, titleId,
  titleClassName, id, description, actions, children, className, copyLayout = "stacked",
}: PageHeroProps) {
  const reduce = useReducedMotion();
  const rise = reduce
    ? { initial: false as const, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };
  return (
    <section id={id} aria-labelledby={titleId} className={cn("studio-intro pb-14 sm:pb-16 md:pb-20", className)}>
      <Container>
        <motion.div {...rise} transition={{ duration: reduce ? 0 : 0.55, ease: EASE }} className="border-b border-white/10 pb-3.5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <span className="flex items-center gap-2.5">
              {hideSignal ? null : <SignalPulse reduce={Boolean(reduce)} />}
              <span className={cn(HERO_KICKER, "text-accent")}>{kickerLeft}</span>
            </span>
            {kickerRight ? <span className={cn(HERO_KICKER, "hidden text-white/45 sm:block")}>{kickerRight}</span> : null}
          </div>
        </motion.div>
        <div className="hero-copy" data-copy-layout={copyLayout}>
          <div className="hero-copy-title">
            {typeof title === "string" ? (
              <h1 id={titleId} className={cn("font-sans text-[clamp(2.75rem,5.8vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-balance text-white", titleClassName)}>
                <RevealText text={title} trigger="load" delay={0.08} />
                {highlight ? <> <span className="text-accent"><RevealText text={highlight} trigger="load" delay={0.2} /></span></> : null}
              </h1>
            ) : <div id={titleId} className={titleClassName}>{title}</div>}
          </div>
          <motion.div {...rise} transition={{ duration: reduce ? 0 : 0.65, delay: reduce ? 0 : 0.35, ease: EASE }} className="hero-copy-lead">
            {typeof description === "string" ? <p className="max-w-[50ch] text-pretty font-sans text-base leading-[1.7] text-white/75 sm:text-[18px]">{description}</p> : description}
          </motion.div>
          {actions ? <motion.div {...rise} transition={{ duration: reduce ? 0 : 0.65, delay: reduce ? 0 : 0.45, ease: EASE }} className="hero-copy-actions flex flex-wrap items-center gap-4 sm:gap-6">{actions}</motion.div> : null}
        </div>
        <motion.div aria-hidden="true" initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.42, ease: EASE }} className="mt-8 h-px w-full origin-left bg-[linear-gradient(90deg,var(--accent)_0%,rgba(0,229,255,0.35)_18%,rgba(255,255,255,0.12)_55%,transparent_100%)] sm:mt-10" />
        {children ? <motion.div {...rise} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.74, ease: EASE }} className="mt-12 sm:mt-14">{children}</motion.div> : null}
      </Container>
    </section>
  );
}
