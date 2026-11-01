"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/data/caseStudies";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

import { ProjectMedia } from "./ProjectMedia";

export type ProjectVariant = "canvas" | "split" | "stacked";

const COPY_REVEAL = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};
const COPY_TIMING = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

/** Sector, name, then the problem the build had to solve. */
function ProjectCopy({
  project,
  size,
  overMedia = false,
}: {
  project: CaseStudy;
  size: "sm" | "lg";
  overMedia?: boolean;
}) {
  return (
    <>
      <motion.p variants={COPY_REVEAL} transition={COPY_TIMING} className="font-sans text-[13px] text-white/60">{project.category}</motion.p>
      <motion.h3
        variants={COPY_REVEAL}
        transition={COPY_TIMING}
        className={cn(
          "mt-3 font-sans font-bold tracking-[-0.035em] transition-colors duration-500 group-hover:text-white",
          size === "lg"
            ? "text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.02] text-white"
            : "text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.05] text-white/90",
        )}
      >
        {project.title}
      </motion.h3>
      <motion.p
        variants={COPY_REVEAL}
        transition={COPY_TIMING}
        className={cn(
          "mt-4 max-w-[46ch] font-sans text-[15px] leading-7",
          overMedia ? "text-white/55 lg:text-white/75" : "text-white/55",
        )}
      >
        {project.tagline}
      </motion.p>
    </>
  );
}

function CaseStudyCue({ overMedia = false }: { overMedia?: boolean }) {
  return (
    <motion.span
      variants={COPY_REVEAL}
      transition={COPY_TIMING}
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[14px] transition-colors",
        overMedia ? "text-white/70 lg:text-white/85" : "text-white/65",
        "group-hover:text-white",
      )}
    >
      <span
        className={cn(
          "border-b pb-0.5 transition-colors",
          overMedia
            ? "border-white/25 group-hover:border-white/70 lg:border-white/40"
            : "border-white/20 group-hover:border-white/60",
        )}
      >
        Read the case study
      </span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </motion.span>
  );
}

/**
 * One project, three compositions. The copy always leads with the problem the
 * build solved, and every composition resolves to the same mobile shape: image
 * first, then the read.
 */
function ProjectLayout({
  project,
  variant = "canvas",
  priority = false,
}: {
  project: CaseStudy;
  variant?: ProjectVariant;
  priority?: boolean;
}) {
  // A preview does not imply a live deployment.
  const galleryAlt = `${project.title} project preview`;

  if (variant === "split") {
    return (
      <Container>
        <Link
          href={`/work/${project.id}`}
          className="group grid items-end gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="order-2 lg:order-1 lg:col-span-4">
            <ProjectCopy project={project} size="sm" />
            <span className="mt-7 inline-block">
              <CaseStudyCue />
            </span>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-8">
            <ProjectMedia
              project={project}
              sizes="(min-width: 1024px) 62vw, 100vw"
              priority={priority}
              ratio="aspect-[5/4] md:aspect-[7/4]"
              alt={galleryAlt}
              surface="gallery"
            />
          </div>
        </Link>
      </Container>
    );
  }

  if (variant === "stacked") {
    return (
      <Link href={`/work/${project.id}`} className="group block">
        <ProjectMedia
          project={project}
          sizes="100vw"
          priority={priority}
          ratio="aspect-[5/4] md:aspect-[7/4]"
          alt={galleryAlt}
          surface="gallery"
        />
        <Container className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="md:max-w-[26ch]">
            <ProjectCopy project={project} size="sm" />
          </div>
          <span className="md:mt-2">
            <CaseStudyCue />
          </span>
        </Container>
      </Link>
    );
  }

  return (
    <Link href={`/work/${project.id}`} className="group block">
      <div className="relative">
        <ProjectMedia
          project={project}
          sizes="100vw"
          priority={priority}
          ratio="aspect-[5/4] md:aspect-[7/4]"
          alt={galleryAlt}
          surface="gallery"
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-t from-black/95 from-5% via-black/70 via-45% to-transparent lg:block"
          aria-hidden="true"
        />
        {/* Mobile: the read sits under the image. Desktop: it sits inside it. */}
        <Container className="mt-7 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:pb-16">
          <ProjectCopy project={project} size="lg" overMedia />
          <span className="mt-5 inline-block">
            <CaseStudyCue overMedia />
          </span>
        </Container>
      </div>
    </Link>
  );
}

export function ProjectFeature(props: {
  project: CaseStudy;
  variant?: ProjectVariant;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.11 } },
      }}
      className="relative"
    >
      <ProjectLayout {...props} />
    </motion.article>
  );
}
