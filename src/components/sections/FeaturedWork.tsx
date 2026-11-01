"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/utils";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { EASE_OUT } from "@/lib/animations";
import { caseStudies } from "@/data/caseStudies";
import type { CaseStudy } from "@/data/caseStudies";

/**
 * Each project reveals in steps so the plate, the read, and the credits arrive
 * as a composed sequence instead of one block fade.
 *
 * One viewport trigger sits on the article and the steps inherit it through
 * `staggerChildren`. Giving each step its own observer was the first attempt and
 * it was wrong: with an inset root, a caption that sits low in the article never
 * crosses the threshold, so it stayed at opacity 0 while it was on screen.
 */
const REVEAL = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

/** The image leads, so it settles from slightly further back than the copy. */
const PLATE_STEP = {
  hidden: { opacity: 0, y: 26, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const COPY_STEP = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

/**
 * The section's whole reduced-motion policy, and the only place the decision is
 * made. `whenMoving` gives a step no timing, so it arrives in a single frame;
 * `startsAt` gives it no starting value, so it is simply present rather than
 * animating in. Every element that can move routes through one of them instead
 * of repeating the decision inline.
 *
 * `reduce` is whatever `useReducedMotion` reports, which is `null` until it has
 * measured the visitor's preference, so the parameter says so rather than
 * narrowing it at each call site.
 */
function whenMoving(reduce: boolean | null, moving: Transition): Transition {
  return reduce ? { duration: 0 } : moving;
}

function startsAt<T>(reduce: boolean | null, from: T): T | false {
  return reduce ? false : from;
}

/**
 * How each entry sits on the page. Two builds run side by side with the read,
 * mirrored between them, and the third takes the whole column so the section
 * closes at full size. Three identical stacks was the earlier shape and it read
 * as a list rather than as a composition.
 */
type EntryLayout = "plate-left" | "plate-right" | "plate-wide";

/**
 * Home-only framing for the three featured builds. The case study pages keep
 * their own descriptions, so each entry here gets a line written to be read on
 * its own. Every sentence stays inside what the project's own record in
 * `caseStudies.ts` supports, and describes the build rather than claiming how it
 * performs today.
 */
const ENTRIES: { id: string; line: string; layout: EntryLayout }[] = [
  {
    id: "forge",
    layout: "plate-left",
    line: "An Echo11 strength-club concept connecting a bold identity, training programs, and membership information in one live website.",
  },
  {
    id: "laltin",
    layout: "plate-right",
    line: "A resort website concept that brings stays, landscape, and local experiences together, with an illustrative stay planner.",
  },
  {
    id: "trueluxe",
    layout: "plate-wide",
    line: "A client skincare storefront with product discovery, collection browsing, and a mobile-first shopping experience.",
  },
];

const CUE_LINK =
  "group/cue inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CUE_RULE =
  "border-b border-white/25 pb-0.5 transition-colors group-hover/cue:border-white/70";

const ARROW =
  "h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

/** The sector and year a build belongs to, read from its own record. */
function EntryMeta({ project }: { project: CaseStudy }) {
  return (
    <p className="font-sans text-[13px] text-white/65">
      {project.category} <span className="text-white/25">/</span> {project.kind === "concept" ? "Studio concept" : project.kind === "owned" ? "Independent project" : `Client build · ${project.year}`}
    </p>
  );
}

function EntryTitle({ project, scale }: { project: CaseStudy; scale: "column" | "wide" }) {
  return (
    <h3
      className={cn(
        "font-sans font-bold leading-[1.03] tracking-[-0.04em] text-white",
        scale === "wide"
          ? "mt-4 text-[clamp(2.1rem,3.6vw,3.2rem)]"
          : "mt-3 text-[clamp(1.8rem,2.2vw,2.4rem)]",
      )}
    >
      {project.title}
    </h3>
  );
}

/**
 * The services and the two destinations of one build. The steps stagger within
 * this block, so the credits settle after the read rather than with it.
 */
function EntryCredits({
  project,
  as = "wide",
  reduce,
}: {
  project: CaseStudy;
  as?: "column" | "wide";
  reduce: boolean | null;
}) {
  return (
    <motion.div
      variants={COPY_STEP}
      transition={whenMoving(reduce, { duration: 0.7, staggerChildren: 0.08, ease: EASE_OUT })}
      className={cn(
        "flex flex-col gap-6",
        as === "wide" && "lg:col-span-5 lg:pt-2",
      )}
    >
      <motion.div
        variants={COPY_STEP}
        transition={whenMoving(reduce, { duration: 0.6, ease: EASE_OUT })}
        className="flex flex-wrap items-center gap-x-7 gap-y-3"
      >
        <Link
          href={`/work/${project.id}`}
          aria-label={`${project.title} case study`}
          className={CUE_LINK}
        >
          <span className={CUE_RULE}>Read the case study</span>
          <ArrowRight className={`${ARROW} group-hover/cue:translate-x-1`} />
        </Link>

        {project.link && project.linkVerifiedOn ? (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title} live site`}
            className="group/live inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/live:border-accent/70">
              Live site
            </span>
            <ArrowUpRight
              className={`${ARROW} group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5`}
            />
          </a>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

/** The read: what the build is and what it had to survive. */
function EntryRead({
  project,
  line,
  scale,
  reduce,
}: {
  project: CaseStudy;
  line: string;
  scale: "column" | "wide";
  reduce: boolean | null;
}) {
  return (
    <motion.div
      variants={COPY_STEP}
      transition={whenMoving(reduce, { duration: 0.7, ease: EASE_OUT })}
      className={cn(scale === "wide" && "lg:col-span-5")}
    >
      <EntryMeta project={project} />
      <EntryTitle project={project} scale={scale} />
      <p className="mt-4 max-w-[48ch] font-sans text-[15px] leading-7 text-white/60 transition-colors duration-500 group-hover:text-white/75 sm:text-[17px]">
        {line}
      </p>
      {scale === "column" ? <EntryBrief project={project} /> : null}
    </motion.div>
  );
}

/** A compact brief: three decisions, read in order without competing cards. */
function EntryBrief({ project }: { project: CaseStudy }) {
  const details = [
    { label: "Challenge", content: project.portfolioBrief?.problem ?? project.challenges[0] },
    { label: "Our contribution", content: project.portfolioBrief?.contribution ?? project.services.slice(0, 3).join(" · ") },
    { label: project.kind === "concept" ? "Design outcome" : "Delivered", content: project.solutions[1] ?? project.solutions[0] },
  ];

  return (
    <dl className="mt-6 border-t border-white/15">
      {details.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[1.5rem_1fr] gap-x-3 border-b border-white/15 py-5 sm:gap-x-4">
          <span aria-hidden="true" className="pt-0.5 font-mono text-[10px] text-accent/75">0{index + 1}</span>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">{item.label}</dt>
            <dd className="mt-2 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-white/80">{item.content}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** The plate, the pointer target, and the affordance that says so. */
function EntryPlate({
  project,
  sizes,
  width,
  reduce,
}: {
  project: CaseStudy;
  sizes: string;
  width: "column" | "wide";
  reduce: boolean | null;
}) {
  return (
    <motion.div
      variants={PLATE_STEP}
      transition={whenMoving(reduce, { duration: 0.9, ease: EASE_OUT })}
      className={cn(width === "wide" ? "lg:col-span-12" : "lg:col-span-8")}
    >
      {/* The plate is a pointer target only. The named links live in the credits,
          so the same case study is never announced twice. */}
      <Link
        href={`/work/${project.id}`}
        aria-hidden="true"
        tabIndex={-1}
        data-cursor="View project"
        className="block"
      >
        {/* The plate describes the picture. Whether the site still answers is
            `linkVerifiedOn`'s job, in the project data. */}
        <ProjectMedia
          project={project}
          sizes={sizes}
          ratio="aspect-[7/4]"
          alt={`${project.title} ${project.kind === "concept" ? "visual concept" : "homepage screenshot"}`}
          surface="feature"
        />
      </Link>
    </motion.div>
  );
}

function Entry({
  project,
  line,
  layout,
}: {
  project: CaseStudy;
  line: string;
  layout: EntryLayout;
}) {
  const reduce = useReducedMotion();
  const wide = layout === "plate-wide";
  const mirrored = layout === "plate-right";

  return (
    <Container>
      <div
        className={cn(
          "grid gap-8 lg:gap-14",
          wide ? "lg:grid-cols-12" : "lg:grid-cols-12 lg:items-start lg:gap-x-16",
        )}
      >
        <EntryPlate
          project={project}
          sizes={wide ? "(min-width: 1280px) 1216px, 100vw" : "(min-width: 1024px) 60vw, 100vw"}
          width={wide ? "wide" : "column"}
          reduce={reduce}
        />
        <div
          className={cn(
            "flex flex-col gap-7",
            wide ? "lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-16" : "lg:col-span-4 lg:pt-8",
            !wide && mirrored && "lg:order-first",
          )}
        >
          <EntryRead project={project} line={line} scale={wide ? "wide" : "column"} reduce={reduce} />
          {wide ? (
            <motion.div variants={COPY_STEP} transition={whenMoving(reduce, { duration: 0.7, ease: EASE_OUT })} className="lg:col-span-7 [&>dl]:mt-0">
              <EntryBrief project={project} />
              <div className="mt-6"><EntryCredits project={project} as="column" reduce={reduce} /></div>
            </motion.div>
          ) : <EntryCredits project={project} as="column" reduce={reduce} />}
        </div>
      </div>
    </Container>
  );
}

export function FeaturedWork() {
  const reduce = useReducedMotion();
  const entries = ENTRIES.map((entry) => ({
    ...entry,
    project: caseStudies.find((item) => item.id === entry.id),
  })).filter(
    (entry): entry is typeof entry & { project: CaseStudy } => Boolean(entry.project),
  );

  return (
    <section className="relative py-24 md:py-36">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-16">
          <RevealText
            as="h2"
            text="Explore the work behind the approach."
            trigger="view"
            blur={4}
            className="font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.04em] text-foreground lg:col-span-6"
          />
          <motion.p
            initial={startsAt(reduce, { opacity: 0, y: 20 })}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 }}
            className="max-w-[46ch] font-sans text-base leading-[1.75] text-white/70 sm:text-[17px] lg:col-span-6 lg:justify-self-end"
          >
            Two live studio concepts and a client storefront. Each case study explains
            the brief, our contribution, and the decisions behind the build.
          </motion.p>
        </div>
      </Container>

      <div className="mt-20 space-y-24 md:mt-28 md:space-y-36">
        {entries.map(({ project, line, layout }) => (
          <motion.article
            key={project.id}
            className="group"
            initial={startsAt(reduce, "hidden")}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={REVEAL}
            transition={whenMoving(reduce, { staggerChildren: 0.12, delayChildren: 0.04 })}
          >
            <Entry project={project} line={line} layout={layout} />
          </motion.article>
        ))}
      </div>

      <Container>
        <motion.div
          initial={startsAt(reduce, { opacity: 0, y: 12 })}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={whenMoving(reduce, { duration: 0.7, ease: EASE_OUT })}
          className="mt-16 grid gap-8 border-y border-white/15 py-8 sm:py-10 md:mt-24 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">The work archive</p>
            <p className="mt-3 font-sans text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-white">More projects. More perspectives.</p>
            <p className="mt-3 max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-white/70">Explore the briefs, design decisions, and builds behind our work.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 lg:gap-x-12">
            <dl className="flex gap-8 border-l border-white/15 pl-5 sm:gap-10">
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/60">Case studies</dt><dd className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white">{caseStudies.length}</dd></div>
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/60">Client builds</dt><dd className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white">{caseStudies.filter(study => study.kind === "client").length}</dd></div>
            </dl>
            <Link href="/work" className={`${CUE_LINK} min-h-11 text-white`}>
              <span className={CUE_RULE}>View all work</span>
              <ArrowRight aria-hidden="true" className={`${ARROW} group-hover/cue:translate-x-1`} />
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
