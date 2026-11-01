"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { caseStudies } from "@/data/caseStudies";
import { WEBSITE_DIRECTIONS } from "@/lib/website-offers";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const DIRECTION_REFERENCES = { "commerce-story": "stepoutinstyle", "service-proof": "expresssocial", "product-narrative": "curriculumos" } as const;
const DIRECTION_COPY = {
  "commerce-story": { outcome: "Help customers explore your range, understand each product, and find a clear path to your store.", bestFor: "Product brands with a focused range or a signature collection." },
  "service-proof": { outcome: "Explain your expertise, show relevant proof, and make it easier for the right clients to inquire.", bestFor: "Consultancies, studios, and specialist service businesses." },
  "product-narrative": { outcome: "Show what your product does, who it helps, and how to try it or learn more.", bestFor: "Software teams and digital products that need a clearer marketing website." },
};

export function MakeItYours() {
  const reduce = useReducedMotion();
  return (
    <section id="website-directions" aria-labelledby="website-directions-heading" className="relative bg-black py-24 md:py-32">
      <Container>
        <div className="max-w-3xl">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">Make it yours / Three directions</p>
          <h2 id="website-directions-heading" className="text-[clamp(2.2rem,4.6vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.04em] text-white">A starting point.<br /><span className="text-white/65">Shaped around you.</span></h2>
          <p className="mt-6 max-w-[52ch] text-pretty text-base leading-7 text-white/70 sm:text-[17px]">Find a direction that feels close. We reshape the structure, design, and content around your business.</p>
        </div>
        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-3 md:gap-6 lg:gap-8">
          {WEBSITE_DIRECTIONS.map((direction, index) => {
            const project = caseStudies.find(item => item.id === DIRECTION_REFERENCES[direction.id]);
            const copy = DIRECTION_COPY[direction.id];
            return <motion.article key={direction.id} initial={reduce ? false : { y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : index * 0.1, ease: [0.16, 1, 0.3, 1] }} className="group flex min-w-0 flex-col">
              <div className="mb-4 flex items-center justify-between border-t border-white/20 pt-4"><p className="text-xl font-semibold text-white">{direction.short}</p><span className="font-mono text-xs text-white/60">0{index + 1}</span></div>
              {project && <figure><Link href={`/work/${project.id}`} aria-label={`View ${project.title} reference`} className={`group block ${FOCUS}`} data-cursor="View reference"><ProjectMedia project={project} surface="gallery" animateEntrance={false} ratio="aspect-[7/4]" sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw" alt={`${project.title} visual reference`} /></Link><figcaption className="mt-3 text-xs leading-5 text-white/60">{project.title} / {project.kind === "concept" ? "Studio concept" : project.kind === "owned" ? "Independent project" : "Client work"}</figcaption></figure>}
              <h3 className="mt-6 text-[clamp(1.65rem,2.5vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">{direction.title}</h3>
              <p className="mt-4 text-pretty text-base leading-7 text-white/70">{copy.outcome}</p>
              <Link href={`/make-it-yours?path=foundation&reference=${direction.id}`} className={`group/link mt-auto flex min-h-14 items-center justify-between gap-4 border-b border-white/20 pb-3 pt-6 text-sm text-white transition-colors hover:border-accent hover:text-accent ${FOCUS}`}>Explore {direction.short.toLowerCase()}<ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform motion-safe:group-hover/link:-translate-y-0.5 motion-safe:group-hover/link:translate-x-0.5" /></Link>
            </motion.article>;
          })}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-white/15 pt-6 md:mt-14"><p className="max-w-[52ch] text-sm leading-6 text-white/65">Visual references, shaped around your business rather than copied. Explore the approaches to compare scope, pricing, and fit.</p><Link href="/make-it-yours#approaches" className={`inline-flex min-h-11 items-center gap-3 text-sm text-white/80 hover:text-accent ${FOCUS}`}>Compare website approaches<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      </Container>
    </section>
  );
}
