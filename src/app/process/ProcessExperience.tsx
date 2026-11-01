"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type Lenis from "lenis";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";

import { PageHero, HeroSecondaryLink } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SourceIcon, GuideIcon, AccessIcon, LaunchIcon } from "./HandoverIcons";
import styles from "./ProcessExperience.module.css";

const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-white/60";
const HEADING = "font-sans text-[clamp(2.1rem,4.5vw,3.8rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground";
const BODY = "text-pretty font-sans text-[15px] leading-7 text-white/70 sm:text-base";
const LINK = "group inline-flex min-h-11 items-center gap-3 text-sm text-white/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background";
const EASE = [0.16, 1, 0.3, 1] as const;

const stages = [
  { id: "discovery", name: "Discovery", title: "Find the right problem to solve.", description: "A better website starts with understanding your business. We clarify who you need to reach, what they need to understand, and the action your website should make easier.", deliverables: ["An agreed scope, page map, and success criteria", "A content plan, required connections, and technical dependencies"], input: "Bring your goals, existing content, and the people who will approve the work. We help turn the unknowns into decisions.", decision: "Agree the scope before design begins.", image: "iso-cross.svg", diorama: "/images/brand/echo11-process-01-discovery-campus-v4.webp", dioramaAlt: "The Echo11 Discovery lounge: two clients discuss their brief and page map with the blue-shirted founder, seated around an oak table beside the shared discovery display.", caption: "Clarity before complexity." },
  { id: "design", name: "Design", title: "Make the direction tangible.", description: "We connect your message with a visual language that feels like your business. You review the key pages and how they adapt to different screens before development begins.", deliverables: ["An approved visual direction", "A responsive page system and consistent design rules"], input: "Give us consolidated feedback on the direction and content. We explain the thinking behind the work so you can make informed choices.", decision: "Approve the page system before we build it.", image: "flow.svg", diorama: "/images/brand/echo11-process-02-design-campus-v2.webp", dioramaAlt: "The Echo11 Design studio: the blue-shirted founder works at a drafting tablet while a designer wearing glasses reviews desktop and mobile layouts, typography, imagery, and colour swatches.", caption: "Your story, given shape." },
  { id: "build", name: "Build", title: "Turn the design into a working website.", description: "We develop the approved pages, connect the agreed content and integrations with clear data and access boundaries, and refine the details that make the experience useful. You can review a working site before it goes live.", deliverables: ["A working website on a review link", "An editable content structure and agreed integrations"], input: "Provide the final content and required account access. Review the website with us and flag anything that needs attention.", decision: "Review the working experience before launch.", image: "commerce.svg", diorama: "/images/brand/echo11-process-03-build-campus-v3.webp", dioramaAlt: "The Echo11 Build workspace: the founder and a teammate review a working website, matching mobile layouts, reusable components, and code across their screens.", caption: "Every piece, working together." },
  { id: "launch", name: "Launch", title: "Go live with a clear handover.", description: "We check the agreed pages and key journeys across screen sizes, prepare the launch, and hand over the website’s foundations. You leave knowing what you own and how to keep moving.", deliverables: ["QA, analytics setup, and your live website", "A launch review and agreed follow-up actions"], input: "Confirm the launch content and provide domain access. We agree who owns each account and the next steps after launch.", decision: "Confirm readiness and ownership before going live.", image: "phyllotaxis-bloom.svg", diorama: "/images/brand/echo11-process-04-launch-campus-v2.webp", dioramaAlt: "The Echo11 Launch platform: the founder, developer, designer wearing glasses, and two clients celebrate beside the WE ARE LIVE screen, responsive website previews, and a handover binder.", caption: "Built to become yours." },
];

const questions = [
  { question: "How much time will our team need?", answer: "Plan for discovery, design feedback, a review of the working site, and launch approval. One decision-maker and consolidated feedback help keep the project moving. We agree the review schedule with your scope." },
  { question: "What if our requirements change?", answer: "We review the impact on scope, cost, and delivery before adding work. The goal is a deliberate decision you understand, with the updated agreement documented before we proceed." },
];

function Entrance({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: EASE }}>{children}</motion.div>;
}

function StageNavigation() {
  const reduce = useReducedMotion();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    function updateStage() {
      frame = 0;
      const headerHeight = document.querySelector(".echo-nav__bar")?.getBoundingClientRect().height ?? 60;
      const threshold = headerHeight + Math.min(180, window.innerHeight * 0.25);
      let current: string | null = null;
      for (const stage of stages) {
        const bounds = document.getElementById(stage.id)?.getBoundingClientRect();
        if (bounds && bounds.top <= threshold && bounds.bottom > headerHeight + 16) current = stage.id;
      }
      setSelectedStage(current);
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateStage);
    }
    updateStage();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  function navigateToStage(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setSelectedStage(id);
    window.history.pushState(window.history.state, "", `#${id}`);
    const headerHeight = document.querySelector(".echo-nav__bar")?.getBoundingClientRect().height ?? 60;
    const sectionMargin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const destination = Math.max(0, window.scrollY + target.getBoundingClientRect().top - Math.max(headerHeight + 16, sectionMargin));
    target.focus({ preventScroll: true });
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(destination, { immediate: Boolean(reduce), duration: 0.9, force: true });
    } else {
      window.scrollTo({ top: destination, behavior: reduce ? "instant" : "smooth" });
    }
  }

  return (
      <nav aria-label="Explore project stages" className="sticky top-24 flex h-[calc(100svh-7rem)] flex-col justify-center gap-5 border-l border-white/20 py-6 sm:gap-7 lg:gap-9 [@media(max-height:620px)]:gap-2 [@media(max-height:620px)]:py-2">
        {stages.map((stage, index) => (
          <Link
            key={stage.id}
            href={`#${stage.id}`}
            aria-label={stage.name}
            title={stage.name}
            onClick={event => navigateToStage(event, stage.id)}
            aria-current={selectedStage === stage.id ? "location" : undefined}
            className={cn(LINK, "-ml-px min-h-16 shrink-0 justify-center border-l-2 px-2 py-4 lg:min-h-20 lg:justify-start lg:gap-4 lg:pl-6 lg:pr-2 [@media(max-height:620px)]:min-h-11 [@media(max-height:620px)]:py-2", selectedStage === stage.id ? "border-accent text-accent" : "border-transparent hover:border-white/50")}
          >
            <Image src={`/images/services/${stage.image}`} alt="" width={32} height={32} className="block h-7 w-7 shrink-0 object-contain lg:hidden" />
            <span className="hidden min-w-0 lg:block">
              <span className="mb-1.5 block font-mono text-[9px] leading-4 tracking-[0.16em] text-white/50 [@media(max-height:620px)]:mb-0">0{index + 1}</span>
              <span className="block font-sans text-xs font-semibold sm:text-base lg:text-xl">{stage.name}</span>
            </span>
            <ArrowRight aria-hidden="true" className="ml-auto hidden h-3.5 w-3.5 shrink-0 transition-transform motion-safe:group-hover:translate-x-1 lg:block" />
          </Link>
        ))}
      </nav>
  );
}

function Journey() {
  return <div id="shared-direction" className="m-0 border-y border-white/15 p-0">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className={LABEL}>One shared direction</p><p className={LABEL}>Four stages / Decisions together</p></div>

      <figure className="relative m-0 aspect-video w-full min-w-0 p-0 lg:aspect-[21/9]">
        <picture>
          <source media="(max-width: 1023px)" srcSet="/images/brand/echo11-master-campus-v4-team-4k.webp" />
        <Image
          src="/images/brand/echo11-master-campus-v4-team-ultrawide-21x9.webp"
          alt="Conceptual Echo11 campus: client consultation in Discovery, creative collaboration in Design, paired development in Build, and the team celebrating with clients at Launch."
          fill
          loading="eager"
          unoptimized
          className="object-contain"
        />
        </picture>
      </figure>
  </div>;
}

const handoverFiles = [
  { id: "source", name: "Website & source", summary: "The foundations to keep building.", icon: SourceIcon, title: "A website you can build on.", description: "Your code, assets, and project structure, organised for the person who works on the website next.", use: "Give a future developer a clear starting point.", rows: [["Website source", "Pages, components, and project files"], ["Content & assets", "The material behind your website"], ["Project notes", "Setup instructions and key dependencies"]] },
  { id: "guide", name: "Content guide", summary: "Know how to make the next edit.", icon: GuideIcon, title: "Keep your content moving.", description: "A practical guide to the agreed editing tools and the changes your team will make most often.", use: "Update everyday content with a clear review process.", rows: [["Pages & copy", "Where to find and edit your content"], ["Images & media", "How to replace assets and prepare uploads"], ["Review & publish", "What to check before changes go live"]] },
  { id: "access", name: "Ownership & access", summary: "Clear accounts. Clear responsibilities.", icon: AccessIcon, title: "Know who holds the keys.", description: "A shared record of the accounts and responsibilities agreed at handover, so access does not become a guessing game.", use: "Find the right account owner when something needs to change.", rows: [["Website code", "Repository access and ownership"], ["Domain & hosting", "Account owners and renewal responsibilities"], ["Connected services", "Agreed roles and service access"]] },
  { id: "launch", name: "Launch & next steps", summary: "A clear record of where we leave off.", icon: LaunchIcon, title: "Leave with a next step.", description: "The launch review and agreed follow-up in one place, giving your team a reference after the website goes live.", use: "Pick up the work without losing the launch context.", rows: [["Launch review", "Agreed pages and key journeys checked"], ["Open decisions", "Any remaining actions and who owns them"], ["Ongoing care", "Next steps and support scope, if agreed"]] },
] as const;

function HandoverDocument({ index }: { index: number }) {
  const file = handoverFiles[index];
  return <div className="min-w-0">
    <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
      <span className={`${LABEL} flex items-center gap-3`}><file.icon aria-hidden="true" className="h-5 w-5 text-accent" />Handover / 0{index + 1}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">Example contents</span>
    </div>
    <h3 className="mt-7 max-w-[22ch] font-sans text-2xl font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-3xl">{file.title}</h3>
    <p className="mt-4 max-w-[50ch] text-sm leading-7 text-white/65 sm:text-[15px]">{file.description}</p>
    <dl className="mt-7 divide-y divide-white/10 border-y border-white/10">
      {file.rows.map(([title, detail], row) => <div key={title} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[20px_0.8fr_1.2fr] sm:gap-4">
        <span aria-hidden="true" className="pt-1 font-mono text-[9px] text-white/30">0{row + 1}</span>
        <dt className="text-sm font-medium text-white/90">{title}</dt>
        <dd className="col-start-2 text-sm leading-6 text-white/50 sm:col-start-auto">{detail}</dd>
      </div>)}
    </dl>
    <div className="mt-6 border-l-2 border-accent/70 pl-4"><p className={LABEL}>What this makes easier</p><p className="mt-2 max-w-[45ch] text-sm leading-6 text-white/80">{file.use}</p></div>
  </div>;
}

function HandoverPreview() {
  const [selected, setSelected] = useState(0);
  const reduce = useReducedMotion();

  function alignOpenedItem(item: HTMLDetailsElement) {
    if (!item.open || !window.matchMedia("(max-width: 1023px)").matches) return;
    window.requestAnimationFrame(() => {
      if (!item.isConnected || !item.open) return;
      const headerHeight = document.querySelector(".echo-nav__bar")?.getBoundingClientRect().height ?? 60;
      const destination = Math.max(0, window.scrollY + item.getBoundingClientRect().top - headerHeight - 16);
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) lenis.scrollTo(destination, { immediate: Boolean(reduce), duration: 0.55, force: true });
      else window.scrollTo({ top: destination, behavior: reduce ? "instant" : "smooth" });
    });
  }

  return <section id="handover-preview" className="scroll-mt-24 border-t border-white/15 py-16 sm:py-24" aria-labelledby="handover-heading">
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 xl:gap-20">
      <div><p className={LABEL}>After launch / Yours to take forward</p><h2 id="handover-heading" className="mt-5 font-sans text-[clamp(2.1rem,3.6vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground">The website.<br /><span className="text-white/55">And the keys to it.</span></h2><p className={`${BODY} mt-6 max-w-[45ch]`}>A handover should help you use what we’ve built. Explore what your team can receive, and how each part helps after launch.</p></div>
      <figure className="min-w-0">
        <Image src="/images/brand/echo11-process-handover-campus-v1.webp" alt="In the Echo11 office, the blue-shirted founder walks two clients through their website on a laptop, with a client guide, handover checklist, and tablet on the oak table." width={1672} height={941} unoptimized sizes="(min-width: 1280px) 650px, (min-width: 1024px) 55vw, 100vw" loading="lazy" className="h-auto w-full" />
        <figcaption className="mt-3 flex flex-wrap justify-between gap-2 border-t border-white/15 pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/50"><span>The handover / Studio illustration</span><span>Ready for your next step</span></figcaption>
      </figure>
    </div>
    <div className="mt-10 border-t border-white/20 sm:mt-14 lg:hidden">
      {handoverFiles.map((item, index) => <details key={item.id} name="process-handover" onToggle={event => alignOpenedItem(event.currentTarget)} className="group border-b border-white/15">
        <summary className="flex cursor-pointer list-none items-start gap-4 py-6 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center text-white/70 transition-colors group-open:text-accent"><item.icon aria-hidden="true" className="h-9 w-9" /></span>
          <span className="min-w-0 flex-1"><span className="block font-sans text-lg font-semibold text-white">{item.name}</span><span className="mt-2 block text-sm leading-6 text-white/50">{item.summary}</span></span>
          <Plus aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-white/60 transition-transform motion-reduce:transition-none group-open:rotate-45 group-open:text-accent" />
        </summary>
        <div className="pb-8 pt-2"><HandoverDocument index={index} /></div>
      </details>)}
      <p className="mt-5 text-xs leading-6 text-white/45">Your final handover follows the agreed scope, editing tools, and connected services.</p>
    </div>
    <div className="mt-10 hidden items-start gap-8 sm:mt-14 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 xl:gap-20">
      <div><div className="grid grid-cols-2 border-t border-white/20 lg:grid-cols-1" aria-label="Handover deliverables">
        {handoverFiles.map((item, index) => <div key={item.id} className="border-b border-white/15">
          <button id={`handover-file-${item.id}`} type="button" aria-pressed={selected === index} aria-controls="handover-document" onClick={() => setSelected(index)} className={cn("group flex w-full items-start gap-3 px-2 py-5 text-left lg:gap-4 lg:px-0 lg:py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:gap-5", selected === index ? "text-white" : "text-white/55 hover:text-white")}>
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center transition-colors", selected === index ? "text-accent" : "text-white/60 group-hover:text-white")}><item.icon aria-hidden="true" className="h-9 w-9" /></span>
            <span className="min-w-0 flex-1"><span className="block font-sans text-sm font-semibold tracking-tight sm:text-lg lg:text-xl">{item.name}</span><span className="mt-2 hidden text-sm leading-6 text-white/50 lg:block">{item.summary}</span></span>
            <ArrowRight aria-hidden="true" className={cn("mt-1.5 h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none", selected === index ? "text-accent" : "text-white/35 group-hover:translate-x-1")} />
          </button>

        </div>)}
        </div><p className="mt-5 max-w-[40ch] text-xs leading-6 text-white/45">Your final handover follows the agreed scope, editing tools, and connected services.</p>
      </div>
      <div id="handover-document" role="region" aria-labelledby={`handover-file-${handoverFiles[selected].id}`} className="min-w-0 pt-6">
        <div className="grid">
          {handoverFiles.map((item, index) => <motion.div key={item.id} aria-hidden={selected !== index} initial={false} animate={{ opacity: selected === index ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.18 }} className={cn("col-start-1 row-start-1 min-w-0", selected !== index && "invisible pointer-events-none")}><HandoverDocument index={index} /></motion.div>)}
        </div>
      </div>
    </div>
    <span className="sr-only hidden lg:block" role="status">Showing {handoverFiles[selected].name}</span>
  </section>;
}

export function ProcessExperience() {
  const reduce = useReducedMotion();
  return <main className="pb-20">
    <PageHero
      copyLayout="stacked"
      kickerLeft="How we work / Collaboration & delivery"
      kickerRight="Four stages · Decisions together"
      titleId="process-title"
      title="A clear path from"
      highlight="ambition to launch."
      description="Building a website should never feel like a black box. We work through four defined stages with shared checkpoints, so you always know what’s being built, why, and what you own."
      actions={
        <>
          <Button asChild size="lg" className="h-12 px-7 text-[13px] tracking-[0.02em]">
            <Link href="/contact" className="gap-3">
              Discuss your project
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <HeroSecondaryLink href="#discovery" icon="down">
            Explore the 4 stages
          </HeroSecondaryLink>
        </>
      }
    />

    <Container>
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Project journey navigation" className="hidden min-w-0 lg:block">
          <StageNavigation />
        </aside>
        <div className="min-w-0">
          <Journey />
      <section aria-labelledby="journey-heading" className="border-t border-white/15">
        <div className="pb-10 pt-12 sm:pb-14 sm:pt-16"><p className={LABEL}>The project journey</p><h2 id="journey-heading" className={`${HEADING} mt-5`}>From the right questions<br className="hidden sm:block" /> to the right website.</h2></div>
        <div className="grid grid-cols-[40px_minmax(0,1fr)] items-stretch gap-4 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6 lg:block">
          <aside aria-label="Project stage navigation" className="min-w-0 lg:hidden"><StageNavigation /></aside>
          <div className="min-w-0">
        {stages.map((stage, index) => (
          <article id={stage.id} key={stage.id} tabIndex={-1} className="focus:outline-none scroll-mt-28 border-t border-white/15 py-14 sm:py-20">
            {/* Top Row: Headline & Intro on Left, Hero Visual on Right */}
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
              <div>
                <p className={`${LABEL} flex items-center gap-5`}>
                  <span className="text-white/60">0{index + 1}</span>
                  {stage.name}
                </p>
                <h3 className="mt-5 max-w-[20ch] font-sans text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-white">
                  {stage.title}
                </h3>
                <p className={`${BODY} mt-6 max-w-[48ch]`}>
                  {stage.description}
                </p>
              </div>

              {/* Visual Slot: Hero 3D Diorama or SVG stage mark */}
              {"diorama" in stage && stage.diorama ? (
                <figure className="min-w-0" aria-label={`3D architectural diorama of Echo11 ${stage.name} stage`}>
                  <motion.div
                    className={cn("relative mx-auto aspect-[4/3] w-full max-w-[560px]", stage.id !== "discovery" && styles.artwork)}
                    initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
                  >
                    <Image
                      src={stage.diorama}
                      alt={stage.dioramaAlt ?? `3D architectural diorama of Echo11 ${stage.name} stage: stylized character at workstation`}
                      fill
                      loading="lazy"
                      unoptimized
                      className="object-contain"
                    />
                    {stage.id !== "discovery" && (
                      <Image
                        aria-hidden="true"
                        src={stage.diorama}
                        alt=""
                        fill
                        loading="lazy"
                        unoptimized
                        className={`object-contain ${styles.hoverTint}`}
                      />
                    )}
                  </motion.div>
                  <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
                    <span>Stage 0{index + 1} / {stage.name}</span>
                    <span className="text-white/80">{stage.caption}</span>
                  </figcaption>
                </figure>
              ) : (
                <figure className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
                  <motion.div
                    className="shrink-0"
                    initial={reduce ? false : { opacity: 0, rotate: -6, scale: 0.94 }}
                    whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
                  >
                    <Image
                      src={`/images/services/${stage.image}`}
                      alt=""
                      width={128}
                      height={128}
                      className="h-28 w-28 object-contain sm:h-32 sm:w-32"
                    />
                  </motion.div>
                  <figcaption className="mt-5 max-w-[24ch] font-sans text-sm leading-6 text-white/60">
                    {stage.caption}
                  </figcaption>
                </figure>
              )}
            </div>

            {/* Bottom Row: 3-Column Deliverables, Input & Decision Specification */}
            <Entrance delay={0.1} className="mt-12 border-t border-white/15 pt-8 sm:mt-16 sm:pt-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
                {/* Column 1: You receive */}
                <div>
                  <p className={LABEL}>You receive</p>
                  <ul className="mt-4 space-y-3">
                    {stage.deliverables.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/90 sm:text-[15px] sm:leading-7">
                        <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent/75" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Your input */}
                <div className="border-t border-white/15 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <p className={LABEL}>Your input</p>
                  <p className={`${BODY} mt-4 text-sm sm:text-[15px]`}>
                    {stage.input}
                  </p>
                </div>

                {/* Column 3: The decision that moves us forward */}
                <div className="border-l-2 border-accent bg-white/[0.025] p-5 sm:p-6">
                  <p className={LABEL}>The decision that moves us forward</p>
                  <p className="mt-3 font-sans text-base font-medium leading-7 text-white">
                    {stage.decision}
                  </p>
                </div>
              </div>
            </Entrance>
          </article>
        ))}
          </div>
        </div>
      </section>

        </div>
      </div>

      <HandoverPreview />

      <section id="project-scope" className="scroll-mt-24 border-t border-white/15 py-16 sm:py-24" aria-labelledby="pace-heading">
        <figure className="mb-10 min-w-0 sm:mb-14">
          <Image
            src="/images/brand/echo11-process-scope-panorama-v1-21x9.webp"
            alt="Two connected Echo11 workspaces: Foundation adapts an established website page system, while Custom brings original layouts, development, and connected services into a larger collaborative workspace."
            width={5040}
            height={2160}
            unoptimized
            loading="lazy"
            className="block h-auto w-full"
          />
          <figcaption className="mt-3 flex flex-wrap justify-between gap-2 border-t border-white/15 pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/50"><span>Foundation &amp; Custom / Studio illustration</span><span>Two approaches. The same care.</span></figcaption>
        </figure>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div><p className={LABEL}>Scope sets the pace</p><h2 id="pace-heading" className={`${HEADING} mt-5 max-w-[15ch]`}>A plan that fits the work.</h2><p className={`${BODY} mt-5 max-w-[40ch]`}>Your schedule follows the work, not a fixed calendar. We agree the dependencies and review windows before committing to delivery.</p></div>
          <div>
            <dl className="divide-y divide-white/15 border-t border-white/15">{[
              ["Content readiness", "Copy, imagery, and existing material need an owner and a preparation date."],
              ["Review windows", "One decision-maker and agreed feedback dates keep approvals moving."],
              ["Technical dependencies", "Account access, integrations, and migration requirements shape the launch plan."],
            ].map(([title, text]) => <div key={title} className="py-6"><dt className="font-sans text-xl font-semibold text-white">{title}</dt><dd className={`${BODY} mt-3`}>{text}</dd></div>)}</dl>
            <Link href="/make-it-yours" className={`${LINK} mt-5`}>Compare approaches, pricing, and typical timelines<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/15 py-16 sm:py-24" aria-labelledby="questions-heading">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><p className={LABEL}>Before we begin</p><h2 id="questions-heading" className={`${HEADING} mt-5`}>Good questions.<br />Clear answers.</h2></div>
          <div className="border-t border-white/15">{questions.map(item => <details key={item.question} className="group border-b border-white/15"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium text-white/90 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden"><h3>{item.question}</h3><Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-white/60 transition-transform motion-reduce:transition-none group-open:rotate-45" /></summary><p className={`${BODY} pb-6 pr-5`}>{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section className="relative border-t border-white/15 pb-5 pt-16 sm:pt-24" aria-labelledby="next-heading">
        <motion.span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-accent/60" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1, ease: EASE }} />
        <p className={LABEL}>Your next move</p><h2 id="next-heading" className="mt-6 max-w-[17ch] font-sans text-[clamp(2.8rem,6.7vw,6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">Bring the ambition.<br /><span className="text-white/55">We’ll shape the next step.</span></h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><p className={`${BODY} max-w-[50ch]`}>Tell us about your business and what the website needs to change. We’ll review your inquiry and reply with a practical next step.</p><div className="flex flex-wrap items-center gap-6"><Button asChild size="lg"><Link href="/contact" className="gap-3">Start a conversation<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></Button><Link href="/work" className={LINK}>Explore the work<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div></div>
      </section>
    </Container>
  </main>;
}
