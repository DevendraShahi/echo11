"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { EASE_OUT } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface Capability {
  title: string;
  /** What the engagement covers, in the same voice as the work credits. */
  scope: string;
  body: string;
}

/**
 * The four disciplines, in the order the heading promises them. Titles and
 * scope are the published list on `/services`, and every entry links there —
 * this band introduces the offer, it does not restate the page that carries it.
 */
const capabilities: Capability[] = [
  {
    title: "Strategy & UX",
    scope: "Audience · Page structure · Wireframes",
    body: "Define who the site is for, what it needs to say, and how visitors move toward the right next step.",
  },
  {
    title: "Design & Development",
    scope: "Visual direction · Responsive pages · CMS",
    body: "Turn the strategy into a distinctive interface and a working website, with content your team can manage.",
  },
  {
    title: "Performance & SEO",
    scope: "Technical search foundations · Speed · Analytics",
    body: "Improve loading speed, structure pages for search, and set up measurement for the actions that matter.",
  },
  {
    title: "Ongoing Care",
    scope: "Updates · Monitoring · Fixes",
    body: "Keep the website current after launch with an agreed plan for maintenance, monitoring, and fixes.",
  },
];

const ENTRY_CUE =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Ghost-set display type: transparent fill under a light stroke, so the wall
 * reads as drawn line-work at rest; hover or keyboard focus fills a title
 * solid white. The stroke is a vendor property, so the fill transition stays
 * on `color` only.
 */
const GHOST_TITLE =
  "block font-sans text-[clamp(2.15rem,5vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:text-white group-focus-visible/row:text-white";

/**
 * Capabilities: the offer as a spotlight wall of ghost type.
 *
 * The homepage spends its display sizes on sentence-statements (`Statement`)
 * and its heading-plus-paragraph bands on the work sections, so this band
 * does neither at the same volume: the claim sits at a medium scale beside
 * its paragraph (no dead column), and the four disciplines become four
 * full-width titles in outline type — the largest, most graphic type on the
 * page. Hover or focus fills the row's title solid and dims its siblings to a
 * spotlight; scope and body ride under each title. No numerals, no rails,
 * no rules between rows, no panels — the stroke and the gutters are the
 * structure.
 *
 * GSAP owns the word reveals through `RevealText` (claim and wall titles);
 * framer-motion owns the kicker, header copy, and rows as one staggered
 * group — they never touch the same nodes. Reduced motion renders it static.
 */
export function Capabilities() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const listVariants: Variants = reduce
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
      };

  const rowVariants: Variants = reduce
    ? { hidden: { opacity: 1, y: 0, filter: "blur(0px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.8, ease: EASE_OUT },
        },
      };

  return (
    <section id="capabilities" className="relative py-24 md:py-36">
      <Container>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/65"
        >
          <span aria-hidden="true" className="h-px w-10 bg-white/25" />
          Strategy · Design · Build · Care
        </motion.p>

        <div className="mt-6 grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-16">
          <div className="lg:col-span-7">
            <RevealText
              as="h2"
              text="One team, from first idea to launch"
              ariaLabel="One team, from first idea to launch."
              trigger="view"
              blur={4}
              className="inline font-sans text-[clamp(2.2rem,4.4vw,3.4rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground"
            />
            <motion.span
              aria-hidden="true"
              initial={reduce ? false : { opacity: 0, scale: 0.3 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 1.5 }}
              className="inline text-accent"
            >
              .
            </motion.span>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
            className="lg:col-span-5 lg:pb-1.5"
          >
            <p className="max-w-[46ch] font-sans text-base leading-[1.75] text-white/70 sm:text-[17px]">
              Strategy, design, and engineering work together from the start. The same
              team connects your message, interface, and content system, with ongoing care
              available after launch.
            </p>

            <Link
              href="/services"
              className="group/cue mt-5 inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/cue:border-accent/70">
                Explore our services
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cue:-translate-y-0.5 group-hover/cue:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        <motion.ol
          variants={listVariants}
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-10 lg:gap-12"
        >
          {capabilities.map((item, index) => (
            <motion.li key={item.title} variants={rowVariants}>
              <details className="group/mobile border-b border-white/20 pb-5 lg:hidden">
                <summary className={`flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden ${ENTRY_CUE}`}>
                  <h3 className="text-[clamp(1.6rem,4.5vw,2.3rem)] font-semibold leading-tight tracking-tight text-white">{item.title}</h3>
                  <span aria-hidden="true" className="shrink-0 text-2xl text-accent group-open/mobile:rotate-45 motion-safe:transition-transform">+</span>
                </summary>
                <p className="mt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.1em] text-white/65">{item.scope}</p>
                <p className="mt-4 max-w-[58ch] text-base leading-7 text-white/75">{item.body}</p>
                <Link href="/services" className={`mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-accent ${ENTRY_CUE}`}>Explore this service<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
              </details>
              <div
                className={cn(
                  "hidden lg:block transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  hovered !== null && hovered !== index && "opacity-70",
                )}
              >
                <Link
                  href="/services"
                  className={`group/row block ${ENTRY_CUE}`}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h3 className="min-w-0 flex-1">
                      <RevealText
                        as="span"
                        text={item.title}
                        trigger="view"
                        blur={3}
                        className={GHOST_TITLE}
                      />
                    </h3>

                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-2 h-5 w-5 shrink-0 text-white/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-accent group-focus-visible/row:text-accent md:mt-4"
                    />
                  </div>

                  <span className="mt-3 block font-mono text-[11px] uppercase leading-5 tracking-[0.14em] text-white/65 transition-colors duration-500 group-hover/row:text-accent/90 group-focus-visible/row:text-accent/90">
                    {item.scope}
                  </span>

                  <p className="mt-3 max-w-[58ch] font-sans text-[15px] leading-7 text-white/60 transition-colors duration-500 group-hover/row:text-white/80">
                    {item.body}
                  </p>
                </Link>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>
  );
}
