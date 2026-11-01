"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { steps } from "@/components/sections/ProcessTimeline";
import { caseStudies } from "@/data/caseStudies";
import { gsap } from "@/lib/gsap";
import { OFFERS } from "@/lib/website-offers";

const EASE = [0.16, 1, 0.3, 1] as const;
const METRICS = [
  { value: OFFERS.foundation.timeline.split(" ")[0], label: "Weeks / Foundation website", context: "A focused starting system, adapted to your brand" },
  { value: OFFERS.custom.timeline.split(" ")[0], label: "Weeks / Custom website", context: "Original design and development around your needs" },
  { value: "Agreed", label: "Scope and cost before we build", context: "Know what is included before committing" },
  { value: String(caseStudies.filter(study => study.kind === "client").length), label: "Client builds in our portfolio", context: "Explore the briefs and work behind them" },
  { value: String(steps.length), label: "Clear stages to launch", context: "Discovery · Design · Build · Launch" },
  { value: "Yours", label: "Your website, in your hands", context: "Code, content structure, and account access at handover" },
];

export function Results() {
  const reduce = useReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduce || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !bandRef.current) return;
    const band = bandRef.current;
    const counters = Array.from(band.querySelectorAll<HTMLElement>("[data-value]"))
      .filter(element => /^\d+$/.test(element.dataset.value ?? ""))
      .map(element => ({ element, target: Number(element.dataset.value), value: 0 }));
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: band, start: "top 86%", once: true } });
      counters.forEach((counter, index) => {
        timeline.to(counter, { value: counter.target, duration: 1.4, ease: "power2.out", onUpdate: () => { counter.element.textContent = String(Math.round(counter.value)); } }, index * 0.08);
      });
    }, band);
    return () => {
      ctx.revert();
      counters.forEach(counter => { counter.element.textContent = String(counter.target); });
    };
  }, [reduce]);

  return (
    <section aria-labelledby="project-confidence-heading" className="relative py-24 md:py-36">
      <Container>
        <motion.h2 id="project-confidence-heading" initial={reduce ? false : { y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduce ? 0 : 0.8, ease: EASE }} className="max-w-[12ch] text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.04em] text-foreground">Plan your project with confidence.</motion.h2>
        <div ref={bandRef} className="mt-12 grid grid-cols-2 gap-px bg-white/[0.07] md:mt-16 md:grid-cols-3">
          {METRICS.map((metric, index) => <motion.div key={metric.label} initial={reduce ? false : { y: 16 }} whileInView={{ y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : index * 0.06 }} className="group bg-background px-4 py-8 transition-colors duration-500 hover:bg-white/[0.03] sm:px-5 md:px-8 md:py-11">
            <p className="text-[clamp(1.7rem,3.4vw,2.9rem)] font-bold leading-none tracking-[-0.04em] text-foreground"><span data-value={metric.value}>{metric.value}</span></p>
            <p className="mt-3 text-sm leading-6 text-white/75">{metric.label}</p>
            <p className="mt-2 max-w-[29ch] text-[13px] leading-6 text-white/60 sm:text-sm">{metric.context}</p>
          </motion.div>)}
        </div>
        <p className="mt-5 max-w-[80ch] text-pretty text-xs leading-6 text-white/60">Timelines are typical website estimates and depend on scope and content readiness. Applications and complex integrations need a separate review; third-party tools retain their own licences.</p>
      </Container>
    </section>
  );
}
