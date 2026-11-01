"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { caseStudies } from "@/data/caseStudies";
import { ProjectInquiryForm } from "@/components/marketing/ProjectInquiryForm";
import { CurrencyCode, OfferPath, ProjectType } from "@/lib/website-offers";

interface ContactExperienceProps {
  initialCurrency: CurrencyCode;
  defaultOffer?: OfferPath;
  defaultProjectType?: ProjectType;
  referenceProject?: string;
  sourcePath: string;
  tracking?: { utmSource?: string; utmMedium?: string; utmCampaign?: string };
}

const LABEL = "font-mono text-[10px] uppercase tracking-[0.18em] text-white/60";
const BODY = "text-pretty text-base leading-7 text-white/65";
const LINK = "group inline-flex min-h-12 items-center gap-3 text-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const NEXT = [
  { title: "You share the starting point.", text: "The business, the ambition, and what needs to change. A few honest sentences are enough." },
  { title: "We find the right questions.", text: "We review the brief and follow up to clarify the audience, requirements and fit." },
  { title: "Together, we define the work.", text: "Scope, deliverables, fees and timing are agreed before design or development begins." },
];
const FAQS = [
  { q: "Do I need a finished brief?", a: "No. Share what you know: what your business does, who you want to reach, and what isn’t working. Choose the budget-help option if you don’t have a range yet." },
  { q: "Can I send files or discuss something sensitive?", a: "Email a brief, deck or reference links to echo11.labs@gmail.com. For confidential projects, start with a general outline and let us know you need to discuss confidentiality before sharing sensitive information. Please don’t send passwords or access credentials in this form." },
];

export function ContactExperience(props: ContactExperienceProps) {
  const project = caseStudies.find(item => item.id === "trueluxe");
  const reduced = useReducedMotion();
  const entrance = reduced ? { initial: false as const } : { initial: { opacity: 0, y: 18 } };
  return (
    <main className="pb-20 sm:pb-28">
      <section className="studio-intro pb-12 sm:pb-20" aria-labelledby="contact-title">
        <Container>
          <div className="flex flex-wrap justify-between gap-3 border-b border-white/15 pb-4">
            <p className={`${LABEL} text-accent`}>Echo11 / Start a project</p>
          </div>
          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1.45fr_1fr] lg:items-end lg:gap-16">
            <h1 id="contact-title" className="text-[clamp(2.8rem,6.8vw,6.6rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
              <RevealText text="A new chapter." trigger="load" /><br />
              <span className="text-accent"><RevealText text="Let’s begin." trigger="load" delay={0.15} /></span>
            </h1>
            <motion.div {...entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.25 }}>
              <p className={`${BODY} max-w-[44ch] sm:text-[17px]`}>A first website. A sharper story. A more useful digital experience. Tell us where you are—and where you want to go.</p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                <Link href="#brief" className="group inline-flex min-h-12 items-center justify-center gap-4 bg-accent px-5 font-mono text-xs uppercase tracking-[0.08em] text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black">Start your brief<ArrowDown aria-hidden="true" className="h-4 w-4" /></Link>
                <a href="mailto:echo11.labs@gmail.com" className={`${LINK} text-white/70`}>Prefer email?<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 grid border-t border-white/15 sm:mt-16 md:grid-cols-3">
            {NEXT.map((step, index) => <motion.article key={step.title} {...entrance} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : index * 0.1 }} className="border-b border-white/15 py-6 md:border-b-0 md:pr-8 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8">
              <div className="flex items-center justify-between"><span className={LABEL}>0{index + 1} / {index === 0 ? "Share" : index === 1 ? "Review" : "Align"}</span>{index < 2 && <ArrowRight aria-hidden="true" className="h-4 w-4 text-white/35" />}</div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h2><p className="mt-3 max-w-[38ch] text-sm leading-6 text-white/60">{step.text}</p>
            </motion.article>)}
          </div>
        </Container>
      </section>

      <Container>
        <section id="brief" className="scroll-mt-28 border-t border-white/15 py-12 sm:py-20" aria-label="Your project brief">
          <div className="grid items-start gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <aside>
              <p className={LABEL}>The starting point</p>
              <h2 className="mt-5 max-w-[12ch] text-[clamp(2rem,3.8vw,3.3rem)] font-semibold leading-[1.08] tracking-[-0.045em]">An early idea<br />is enough.</h2>
              <p className={`${BODY} mt-5 max-w-[34ch]`}>You don’t need every answer. Help us understand the outcome, and we’ll help shape the questions that come next.</p>
              <div className="mt-8 border-y border-white/15 py-5"><p className={LABEL}>Rather talk in writing?</p><a href="mailto:echo11.labs@gmail.com" className={`${LINK} mt-2 break-all text-white`}>echo11.labs@gmail.com<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" /></a></div>
              {project && <figure className="mt-8">
                <Link href="/work/trueluxe" aria-label="Explore TrueLuxe Nepal, a client commerce build" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black">
                  <ProjectMedia project={project} surface="feature" ratio="aspect-[7/4]" sizes="(min-width: 1024px) 34vw, 100vw" animateEntrance={false} alt="TrueLuxe Nepal skincare storefront: a premium product story with faceted discovery and a short path to checkout" />
                </Link>
                <figcaption className="mt-4 border-b border-white/15 pb-5">
                  <p className={LABEL}>From the studio / Client build</p>
                  <Link href="/work/trueluxe" className={`${LINK} mt-1 text-white`}>TrueLuxe Nepal<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
                  <p className="text-sm leading-6 text-white/60">A storefront shaped around product confidence. Your project starts with its own audience and ambition.</p>
                </figcaption>
              </figure>}
              <Link href="/make-it-yours" className={`${LINK} mt-4 text-white/60`}>Help me choose an approach<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></Link>
            </aside>
            <ProjectInquiryForm {...props} />
          </div>
        </section>

        <section className="border-t border-white/15 py-12 sm:py-20" aria-labelledby="contact-questions">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div><p className={LABEL}>Before you send</p><h2 id="contact-questions" className="mt-5 text-[clamp(2.1rem,4.5vw,3.8rem)] font-semibold leading-[1.06] tracking-[-0.045em]">A little clarity.</h2></div>
            <div className="border-t border-white/15">
              {FAQS.map(faq => <details key={faq.q} className="group border-b border-white/15"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">{faq.q}<Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-white/50 transition-transform group-open:rotate-45 motion-reduce:transition-none" /></summary><p className={`${BODY} pb-6 pr-6`}>{faq.a}</p></details>)}
            </div>
          </div>
        </section>
        <nav aria-label="Get to know Echo11" className="flex flex-col justify-between gap-5 border-y border-white/15 py-6 sm:flex-row sm:items-center"><p className="text-sm text-white/55">Want to know us a little better first?</p><div className="flex flex-wrap gap-x-8"><Link href="/work" className={LINK}>Our work<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link><Link href="/process" className={LINK}>How we work<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div></nav>
      </Container>
    </main>
  );
}
