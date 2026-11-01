"use client";

import { Fragment, useLayoutEffect, useRef, type ElementType } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "@/lib/gsap";

interface RevealTextProps {
  /** Plain text to reveal. Split on whitespace; each word gets its own mask. */
  text: string;
  as?: ElementType;
  className?: string;
  /**
   * "view" reveals when the element scrolls into view (below the fold).
   * "load" plays on mount, after `delay` (hero / splash handoff).
   */
  trigger?: "view" | "load";
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  /** Starting tilt per word, in degrees. 0 keeps the reveal purely vertical. */
  rotate?: number;
  /** Starting blur in px for a softer, produx-style arrival. */
  blur?: number;
  /** Accessible label override when the visual text needs trimming. */
  ariaLabel?: string;
  /**
   * Reveal gate. While false the words stay in their hidden initial state;
   * flip to true to start the animation (the splash exit hands off this way).
   */
  when?: boolean;
}

/**
 * The house text reveal: every word sits in an overflow-hidden mask, starts
 * translated below it, and rises into place. Initial hidden state ships in the
 * markup (no flash between paint and hydration) and is stood down by the
 * reduced-motion policy in globals.css.
 *
 * GSAP owns this component end to end; siblings animated by framer-motion must
 * not wrap or target the same nodes.
 */
export function RevealText({
  text,
  as: Tag = "span",
  className,
  trigger = "view",
  delay = 0,
  stagger = 0.055,
  rotate = 0,
  blur = 0,
  ariaLabel,
  when = true,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const words = text.split(/\s+/).filter(Boolean);

  useLayoutEffect(() => {
    if (reduce || !ref.current || !when) return;
    const el = ref.current;
    const targets = el.querySelectorAll<HTMLElement>(".reveal-word");
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, {
        y: 0,
        yPercent: 110,
        rotate,
        opacity: 0,
        ...(blur ? { filter: `blur(${blur}px)` } : {}),
      });

      const vars: gsap.TweenVars = {
        y: 0,
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.05,
        ease: "power3.out",
        stagger,
      };

      if (trigger === "load") {
        gsap.to(targets, { ...vars, delay });
      } else {
        gsap.to(targets, {
          ...vars,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [reduce, when, trigger, delay, stagger, rotate, blur, text]);

  return (
    <Tag ref={ref} className={className} aria-label={ariaLabel ?? text}>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="reveal-mask inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
              <span className="reveal-word inline-block will-change-transform">{word}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
