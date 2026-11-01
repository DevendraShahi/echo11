"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { ProjectMedia } from "./ProjectMedia";

const FEATURED_IDS = ["laltin", "trueluxe", "leaders"];
const featured = FEATURED_IDS.flatMap((id) => {
  const project = caseStudies.find((item) => item.id === id);
  return project ? [project] : [];
});
const ease = [0.16, 1, 0.3, 1] as const;

function provenance(project: CaseStudy) {
  if (project.kind === "concept") return "Echo11-owned brand concept";
  if (project.kind === "owned") return "Independent project · Original branding";
  // Some older records lack confirmed commissioning details.
  return "Website & platform work";
}

function Story({ project, index }: { project: CaseStudy; index: number }) {
  const reduce = useReducedMotion();
  const brief = project.portfolioBrief;
  if (!brief) return null;

  const media = (
    <Link href={`/work/${project.id}`} data-cursor="Explore project" aria-label={`Explore ${project.title}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <ProjectMedia
        project={project}
        sizes={index === 0 ? "(min-width: 1280px) 1280px, 100vw" : "(min-width: 1024px) 60vw, 100vw"}
        ratio="aspect-[7/4]"
        alt={`${project.title} ${project.kind === "concept" ? "brand concept visual" : "website preview"}`}
        surface="gallery"
        entrance={index === 0 ? "up" : index === 1 ? "right" : "left"}
        revealOnLoad
      />
    </Link>
  );

  const copy = (
    <div>
      <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 0.6 }} className="font-mono text-[10px] uppercase tracking-[0.16em] leading-5 text-white/65">
        {project.category} <span className="px-2 text-white/20">/</span> {provenance(project)}
      </motion.p>
      <RevealText
        as="h3"
        text={project.title}
        className="mt-3 font-sans text-[clamp(2rem,4.3vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.045em]"
      />
      <motion.div
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.1 } } }}
      >
        <motion.p
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.7, ease }}
          className="mt-4 max-w-[50ch] text-pretty text-base leading-7 text-white/70 sm:text-lg sm:leading-8"
        >
          {brief.problem}
        </motion.p>
        <motion.dl
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.7, ease }}
          className="mt-6 grid gap-4 border-t border-white/10 pt-5"
        >
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">Who it serves</dt>
            <dd className="mt-2 text-[15px] leading-7 text-white/75">{brief.audience}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">Our contribution</dt>
            <dd className="mt-2 text-pretty text-[15px] leading-7 text-white/75">{brief.contribution}</dd>
          </div>
        </motion.dl>
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.7, ease }}
          className="mt-7"
        >
          <Link href={`/work/${project.id}`} className="group inline-flex items-center gap-3 border-b border-white/25 pb-1 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent">
            Explore the {project.kind === "concept" ? "concept" : "project"}
            <ArrowUpRight className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <article className="relative pt-6 md:pt-8">
      <motion.div aria-hidden="true" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 0.9, ease }} className="absolute inset-x-0 top-0 h-px origin-left bg-white/10" />
      <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 0.6 }} className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Selected story / 0{index + 1}</motion.p>
      {index === 0 ? (
        <>
          {media}
          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <p className="max-w-[18ch] text-2xl font-semibold leading-tight tracking-[-0.03em] text-white/65">
              A retreat, imagined for the web.
            </p>
            {copy}
          </div>
        </>
      ) : (
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
          <div className={index === 1 ? "lg:order-2" : ""}>{media}</div>
          <div>{copy}</div>
        </div>
      )}
    </article>
  );
}

export function EditorialWork({ excludeIds = [] }: { excludeIds?: readonly string[] }) {
  const archive = caseStudies.filter(project => !FEATURED_IDS.includes(project.id) && !excludeIds.includes(project.id));
  const reduce = useReducedMotion();
  return (
    <Container>
      <div className="mt-8 space-y-14 md:mt-12 md:space-y-20">
        {featured.map((project, index) => <Story key={project.id} project={project} index={index} />)}
      </div>
      <section aria-label="More projects" className="mt-16 border-t border-white/10 pt-8 md:mt-20 md:pt-10">
        <RevealText as="h2" text="Explore more work." className="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-tight tracking-[-0.04em]" />
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-white/70">
          More website studies, brand concepts, and platform projects from the studio.
        </p>
        <div className="mt-8 grid gap-x-8 gap-y-10 md:mt-10 md:grid-cols-2 md:gap-y-12">
          {archive.map((project, index) => (
            <motion.article
              key={project.id}
              className="motion-reduce:!transform-none motion-reduce:!opacity-100"
              initial={reduce ? false : { opacity: 0.4, y: 40, x: index % 2 === 0 ? -16 : 16, rotate: index % 2 === 0 ? -0.8 : 0.8, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: reduce ? 0 : 0.95, delay: reduce ? 0 : (index % 2) * 0.12, ease }}
            >
              <Link href={`/work/${project.id}`} data-cursor="Explore project" className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <div className="transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-focus-visible:-translate-y-1">
                <ProjectMedia project={project} sizes="(min-width: 768px) 50vw, 100vw" ratio="aspect-[7/4]" alt={`${project.title} project preview`} surface="gallery" revealOnLoad animateEntrance={false} />
                </div>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] leading-5 text-white/60">{provenance(project)}</p>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-accent group-focus-visible:text-accent">{project.title}</h3>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-white/50 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5" />
                </div>
                <p className="mt-3 max-w-[48ch] text-pretty text-sm leading-6 text-white/70">{project.tagline}</p>
                {project.id === "green" && <p className="mt-2 text-xs leading-5 text-white/60">Editorial imagery · Earlier platform work</p>}
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </Container>
  );
}
