"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { getCaseStudy } from "@/data/caseStudies";
import { EASE_OUT } from "@/lib/animations";

/**
 * The same reduced-motion contract FeaturedWork uses: `whenMoving` gives a step
 * no timing so it arrives in one frame, `startsAt` gives it no starting value so
 * it is simply present. Every motion decision routes through one of them.
 */
function whenMoving(reduce: boolean | null, moving: Transition): Transition {
  return reduce ? { duration: 0 } : moving;
}

function startsAt<T>(reduce: boolean | null, from: T): T | false {
  return reduce ? false : from;
}

const PLATE_STEP = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const COPY_STEP = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const CUE_LINK =
  "group/cue inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CUE_RULE = "border-b border-white/25 pb-0.5 transition-colors group-hover/cue:border-white/70";

const ARROW =
  "h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * "Now showing": the lead band on `/work` for the studio's newest build while
 * it is open to walk through. One project, one plate, two destinations — the
 * live showcase in a new tab (it is its own site), the case study in this one.
 *
 * The plate is a pointer target only, in the house pattern: the named links
 * live in the cue rail, so the live showcase is never announced twice.
 *
 * The record lives in `caseStudies.ts`; this component reads it rather than
 * restating the project's copy, so an edit there moves both surfaces.
 */
export function LiveShowcase() {
  const project = getCaseStudy("forge");
  const reduce = useReducedMotion();

  if (!project) return null;

  return (
    <section className="relative pb-16 md:pb-24">
      <Container>
        <motion.div
          aria-hidden="true"
          initial={startsAt(reduce, { scaleX: 0 })}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 1, ease: EASE_OUT }}
          className="h-px origin-left bg-white/15"
        />

        <motion.div
          initial={startsAt(reduce, { opacity: 0, y: 12 })}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={whenMoving(reduce, { duration: 0.6, ease: EASE_OUT })}
          className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2"
        >
          <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Now showing
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Live build <span className="px-2 text-white/20">/</span> {project.year}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-x-16">
          <RevealText
            as="h2"
            text="A concept you can explore."
            trigger="view"
            blur={4}
            className="font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.04em] text-foreground lg:col-span-6"
          />
          <motion.p
            initial={startsAt(reduce, { opacity: 0, y: 20 })}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE_OUT, delay: reduce ? 0 : 0.08 }}
            className="max-w-[46ch] font-sans text-base leading-[1.75] text-white/55 sm:text-[17px] lg:col-span-6 lg:justify-self-end"
          >
            {project.title} is a studio concept — a strength gym brand carried through one
            scrolling site, from manifesto to membership, built to be walked through rather than
            screenshotted.
          </motion.p>
        </div>

        <motion.article
          className="group mt-10 md:mt-14"
          initial={startsAt(reduce, "hidden")}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } } }}
        >
          <motion.div variants={PLATE_STEP} transition={whenMoving(reduce, { duration: 0.9, ease: EASE_OUT })}>
            {/* The plate is a pointer target only; the cue rail below carries
                the named links, so the same showcase is never announced twice. */}
            <Link
              href="/showcase/forge"
              target="_blank"
              rel="noreferrer"
              aria-hidden="true"
              tabIndex={-1}
              data-cursor="Open live site"
              className="block"
            >
              <ProjectMedia
                project={project}
                sizes="(min-width: 1280px) 1216px, 100vw"
                ratio="aspect-[7/4]"
                alt={`${project.title} showcase site hero`}
                surface="feature"
              />
            </Link>
          </motion.div>

          <motion.div
            variants={COPY_STEP}
            transition={whenMoving(reduce, { duration: 0.7, ease: EASE_OUT })}
            className="mt-7 grid gap-7 border-t border-white/10 pt-6 lg:grid-cols-12 lg:gap-x-16"
          >
            <div className="lg:col-span-4">
              <h3 className="font-sans text-[clamp(1.9rem,3vw,2.8rem)] font-bold leading-[1.03] tracking-[-0.04em] text-white">
                {project.title}
              </h3>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] leading-5 text-white/60">
                {project.category} <span className="px-2 text-white/20">/</span> Echo11 concept
              </p>
            </div>

            <motion.p
              variants={COPY_STEP}
              transition={whenMoving(reduce, { duration: 0.6, ease: EASE_OUT })}
              className="max-w-[34ch] font-sans text-[13px] leading-6 text-white/45 lg:col-span-4"
            >
              {project.services.join(" · ")}
            </motion.p>

            <motion.div
              variants={COPY_STEP}
              transition={whenMoving(reduce, { duration: 0.6, ease: EASE_OUT })}
              className="flex flex-wrap items-start gap-x-7 gap-y-3 lg:col-span-4 lg:justify-self-end"
            >
              <a
                href="/showcase/forge"
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} live showcase, opens in a new tab`}
                className="group/live inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/live:border-accent/70">
                  Open the live showcase
                </span>
                <ArrowUpRight
                  className={`${ARROW} group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5`}
                />
              </a>

              <Link
                href={`/work/${project.id}`}
                aria-label={`${project.title} case study`}
                className={CUE_LINK}
              >
                <span className={CUE_RULE}>Read the case study</span>
                <ArrowRight className={`${ARROW} group-hover/cue:translate-x-1`} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.article>
      </Container>
    </section>
  );
}
