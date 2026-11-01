"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type Lenis from "lenis";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHero, HeroSecondaryLink } from "@/components/layout/PageHero";
import { CurrencySwitcher } from "@/components/marketing/CurrencySwitcher";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectMedia } from "@/components/work/ProjectMedia";
import { caseStudies } from "@/data/caseStudies";
import { getWebsiteDirection, OFFERS, WEBSITE_DIRECTIONS, formatOfferPrice, type CurrencyCode, type OfferPath, type WebsiteDirectionId } from "@/lib/website-offers";
import { NextStepBrief } from "./NextStepBrief";
import { ConceptSpread } from "./ConceptSpread";
import { FIT_OPTIONS, fitLabel, getRecommendation, type FitAnswers } from "./website-fit";

interface FoundationsExperienceProps {
  initialCurrency: CurrencyCode;
  initialPath: OfferPath;
  initialReference?: string;
  tracking: { utmSource?: string; utmMedium?: string; utmCampaign?: string };
}
const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-white/60";
const HEADING = "font-sans text-[clamp(2.1rem,4.5vw,3.8rem)] font-semibold leading-[1.06] tracking-[-0.045em]";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black";
const QUESTIONS = [
  { title: "Your project", short: "Project", question: "What are we building?", keys: ["projectType"] },
  { title: "Your audience", short: "Visitors", question: "What should visitors be able to do?", keys: ["interaction"] },
  { title: "Your content", short: "Content", question: "What content needs a home?", keys: ["content"] },
  { title: "Your connections", short: "Setup", question: "What needs to connect or move?", keys: ["integrations", "migration"] },
] as const;
const FAQS = [
  ["Can a Commerce direction include checkout?", "The Foundation direction covers public product storytelling and can link to an existing store. Cart, payments, inventory, and store integrations are scoped separately as Custom. Full applications need a separate fit review."],
  ["Can I change my choices after the fit check?", "Yes. Update your answers or preferred direction and review the revised recommendation. Confirm your choices again before sending the brief; your written project details stay in place."],
  ["What is included in the starting price?", "Each approach’s core services are listed in the comparison. The starting price is an estimate, not a fixed quote. Your proposal confirms page count, content preparation, editing tools, migration, revisions, support, taxes, and third-party costs."],
];

export function FoundationsExperience({ initialCurrency, initialPath, initialReference, tracking }: FoundationsExperienceProps) {
  const carried = getWebsiteDirection(initialReference);
  const [currency, setCurrency] = useState(initialCurrency);
  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  }, []);

  const [verticalTabs, setVerticalTabs] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setVerticalTabs(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const [requested, setRequested] = useState(initialPath);
  const [directionId, setDirectionId] = useState<WebsiteDirectionId | null>(carried?.id ?? null);
  const [answers, setAnswers] = useState<FitAnswers>({ projectType: carried?.projectType ?? "", interaction: "", content: "", integrations: "", migration: "" });
  const [question, setQuestion] = useState(0);
  const [questionError, setQuestionError] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [scrollRequest, setScrollRequest] = useState<{ id: string; focus: string } | null>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const directionTabs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduced = useReducedMotion();
  const direction = getWebsiteDirection(directionId ?? undefined);
  const previewDirection = direction ?? WEBSITE_DIRECTIONS[0];
  const project = caseStudies.find(item => item.id === previewDirection.proof[0]);
  const result = getRecommendation(answers, requested);
  const offer = OFFERS[result.path];
  const complete = Object.values(answers).every(Boolean);
  const activeQuestion = QUESTIONS[question];
  const answerSummary = Object.entries(answers).map(([key, value]) => `${key}: ${fitLabel(key as keyof FitAnswers, value)}`).join("; ");
  const reference = `${direction ? `Direction: ${direction.title}. ` : ""}Requested approach: ${requested}. ${answerSummary}. ${result.reasons.join(" ")}`;
  function go(id: string, focus = id) { setScrollRequest({ id, focus }); }
  useLayoutEffect(() => {
    if (!scrollRequest) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(scrollRequest.id);
      const focused = document.getElementById(scrollRequest.focus);
      if (!target) return;
      focused?.focus({ preventScroll: true });
      const offset = (document.querySelector("header")?.getBoundingClientRect().height ?? 64) + 12;
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) { lenis.resize(); lenis.scrollTo(window.scrollY + target.getBoundingClientRect().top - offset, { immediate: Boolean(reduced), duration: 0.65, force: true }); }
      else window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - offset, behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollRequest, reduced]);
  function invalidate() { setConfirmed(false); }
  function update<Key extends keyof FitAnswers>(key: Key, value: FitAnswers[Key]) {
    setAnswers(current => ({ ...current, [key]: value })); setQuestionError(""); invalidate();
  }
  function selectDirection(id: WebsiteDirectionId, index: number) {
    const next = getWebsiteDirection(id);
    setDirectionId(id); if (next) update("projectType", next.projectType);
    directionTabs.current[index]?.focus({ preventScroll: true });
  }
  function moveQuestion(index: number, focusHeading = false) {
    setQuestion(index); setQuestionError("");
    if (focusHeading) {
      go("question-panel", `question-heading-${index}`);
    } else {
      go("question-navigation", `question-tab-${index}`);
    }
  }
  function advance() {
    if (activeQuestion.keys.some(key => !answers[key])) { setQuestionError("Choose an answer, including ‘Not sure’ if you need help."); return; }
    if (question < 3) moveQuestion(question + 1, true);
    else {
      const missing = QUESTIONS.findIndex(item => item.keys.some(key => !answers[key]));
      if (missing >= 0) { moveQuestion(missing, true); setQuestionError("Please answer this question before seeing your recommendation."); return; }
      setHasResult(true); setConfirmed(true); go("route", "route-heading");
    }
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, select: (i: number) => void) {
    let next: number;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault(); select(next);
  }
  return <PageWrapper><main className="relative overflow-x-clip pb-20 text-white">
    <PageHero
      copyLayout="stacked"
      id="directions"
      className="pb-16 sm:pb-24"
      kickerLeft="Website directions / Echo11"
      kickerRight="Explore · Adapt · Make it yours"
      title="Make it"
      highlight="yours."
      description="Choose a starting direction. We shape the design, content, and experience around your business — whether through a proven Foundation or an original Custom build."
      actions={
        <>
          <Button type="button" size="lg" className="h-12 gap-3 px-7 text-[13px] tracking-[0.02em]" onClick={() => go("fit-check", "fit-heading")}>
            Find my approach
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Button>
          <HeroSecondaryLink href="#live-concepts">
            Explore live concepts
          </HeroSecondaryLink>
        </>
      }
    >
      <div role="tablist" aria-label="Website directions" aria-orientation="horizontal" className="grid grid-cols-3 border-b border-white/15">{WEBSITE_DIRECTIONS.map((item, index) => <button key={item.id} ref={node => { directionTabs.current[index] = node; }} id={`direction-tab-${index}`} type="button" role="tab" aria-selected={previewDirection.id === item.id} aria-controls={`direction-panel-${index}`} tabIndex={previewDirection.id === item.id ? 0 : -1} onClick={() => selectDirection(item.id, index)} onKeyDown={event => tabKey(event, index, 3, i => selectDirection(WEBSITE_DIRECTIONS[i].id, i))} className={`flex min-h-16 min-w-0 items-center gap-3 border-b-2 px-1 py-4 text-left text-sm font-semibold min-[380px]:text-base sm:gap-5 sm:text-2xl ${FOCUS} ${previewDirection.id === item.id ? "border-accent text-white" : "border-transparent text-white/60 hover:text-white"}`}><span className="hidden font-mono text-xs font-normal text-white/50 sm:block">0{index + 1}</span>{item.short}<ArrowUpRight aria-hidden="true" className={`ml-auto mr-2 hidden h-4 w-4 sm:block ${previewDirection.id === item.id ? "text-accent" : "opacity-0"}`} /></button>)}</div>
      {WEBSITE_DIRECTIONS.map((item, index) => <div key={item.id} hidden={item.id !== previewDirection.id} id={`direction-panel-${index}`} role="tabpanel" aria-labelledby={`direction-tab-${index}`} tabIndex={0} className={`pt-8 ${FOCUS}`}>{item.id === previewDirection.id && <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {project && <figure className="group min-w-0"><ProjectMedia key={project.id} project={project} surface="gallery" priority animateEntrance={false} ratio="aspect-[7/4]" alt={`${project.title} visual reference`} sizes="(min-width: 1024px) 850px, 100vw" /><figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-white/65"><span>{project.title} / {project.kind === "concept" ? "Studio concept" : project.kind === "owned" ? "Independent project" : "Client work"}</span><Link href={`/work/${project.id}`} className="inline-flex min-h-11 items-center gap-2">View reference<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></figcaption></figure>}
        <div className="flex flex-col justify-center lg:pb-8"><p className={`${LABEL} text-accent`}>0{index + 1} / The direction</p><h2 className="mt-4 max-w-[18ch] font-sans text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{item.title}</h2><p className="mt-5 text-pretty font-sans text-[15px] leading-7 text-white/75 sm:text-base">{item.outcome}</p><dl className="mt-6 border-t border-white/15"><div className="py-4"><dt className={LABEL}>Shaped around</dt><dd className="mt-2 text-sm leading-6 text-white/75">{item.adapts.join(" · ")}</dd></div></dl><button type="button" onClick={() => { selectDirection(item.id, index); go("fit-check", "fit-heading"); }} className={`mt-2 inline-flex min-h-12 items-center justify-between gap-5 border-b border-accent/60 pb-2 text-base text-white ${FOCUS}`}>Make this direction yours<ArrowRight aria-hidden="true" className="h-5 w-5 text-accent" /></button><p className="mt-4 text-sm leading-6 text-white/60">A reference for the direction, not a design for resale.{directionId === item.id ? " Attached to your brief." : ""}</p></div>
      </div>}</div>)}

    </PageHero>

    <section id="approaches" className="scroll-mt-24 py-16 sm:py-24"><Container>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><p className={LABEL}>The approach</p><h2 className={`mt-5 max-w-[15ch] ${HEADING}`}>A foundation.<br />Or a fresh start.</h2><div className="mt-6"><CurrencySwitcher value={currency} onChange={setCurrency} /></div><p className="mt-5 max-w-[32ch] text-sm leading-6 text-white/65">Two delivery routes. Both shaped around your brand. Final scope and costs are agreed together.</p></div>
        <div>{(["foundation", "custom"] as const).map((path, index) => <article key={path} className={`grid gap-5 border-t py-6 sm:grid-cols-[1fr_auto] ${requested === path ? "border-accent/70" : "border-white/15"}`}><div><p className="font-mono text-xs text-white/50">0{index + 1}</p><h3 className="mt-3 font-sans text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{OFFERS[path].shortLabel}</h3><p className="mt-3 max-w-[42ch] text-base leading-7 text-white/75">{path === "foundation" ? "Start with an established website structure, then adapt the pages, content, and design to your business." : "Plan and build an original website around your business, including any checkout, data, or integration needs."}</p><ul aria-label={`${OFFERS[path].shortLabel} core services`} className="mt-4 space-y-2 text-sm leading-6 text-white/75">{OFFERS[path].includes.map(item => <li key={item} className="border-l border-white/20 pl-3">{item}</li>)}</ul><button type="button" aria-pressed={requested === path} onClick={() => { setRequested(path); invalidate(); }} className={`mt-3 inline-flex min-h-11 items-center gap-3 text-sm ${FOCUS} ${requested === path ? "text-accent" : "text-white/75"}`}>{requested === path ? "Your preferred approach" : `Prefer ${OFFERS[path].shortLabel}`}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button></div><dl className="flex flex-wrap gap-x-8 gap-y-4 sm:flex-col sm:gap-4 sm:pt-7 sm:text-right"><div><dt className={LABEL}>Starting at</dt><dd className="mt-1 font-mono text-xl">{formatOfferPrice(path, currency)}</dd></div><div><dt className={LABEL}>Typical delivery</dt><dd className="mt-1 text-sm text-white/80">{OFFERS[path].timeline}</dd></div></dl></article>)}<p className="border-t border-white/15 pt-5 text-sm leading-6 text-white/65">Foundation is for public marketing and product storytelling. Checkout and connected systems need Custom scope. Applications require a separate review; these website estimates do not apply.</p></div>
      </div>
    </Container></section>

    <ConceptSpread />

    <section id="fit-check" className="scroll-mt-24 py-16 sm:py-24 [overflow-anchor:none]"><Container>
      <p className={LABEL}>The fit check</p><h2 id="fit-heading" tabIndex={-1} className={`mt-5 outline-none ${HEADING}`}>Let’s find your fit.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/75">Tell us what the website needs to do. Four short steps, then a clear next move.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
        <div id="question-navigation" role="tablist" aria-label="Fit-check steps" aria-orientation={verticalTabs ? "vertical" : "horizontal"} className="grid grid-cols-4 gap-2 self-start lg:grid-cols-1">{QUESTIONS.map((item, index) => <button key={item.title} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`question-tab-${index}`} aria-selected={question === index} aria-controls={`question-content-${index}`} tabIndex={question === index ? 0 : -1} onClick={() => moveQuestion(index)} onKeyDown={event => tabKey(event, index, 4, moveQuestion)} className={`min-h-12 px-2.5 py-3 text-left transition-colors ${FOCUS} ${question === index ? "bg-accent text-black" : "text-white/75 hover:bg-white/5"}`}><span className="block font-mono text-xs sm:text-sm">0{index + 1}</span><span className="mt-1 block break-words text-[11px] font-medium sm:text-xs lg:hidden">{item.short}</span><span className="mt-2 hidden text-sm lg:block">{item.title}</span></button>)}</div>
        <div id="question-panel" className="min-w-0 scroll-mt-24">{QUESTIONS.map((item, index) => <div key={item.title} role="tabpanel" hidden={question !== index} id={`question-content-${index}`} aria-labelledby={`question-tab-${index}`}>
          {question === index && <motion.div key={question} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.3 }}><p className={LABEL}>Step {question + 1} of 4</p><h3 id={`question-heading-${index}`} tabIndex={-1} className="mt-3 text-2xl font-semibold tracking-tight outline-none sm:text-3xl">{item.question}</h3>
            <div className="mt-6 space-y-6">{item.keys.map(key => <div key={key}><label id={`fit-${key}-label`} htmlFor={`fit-${key}`} className="mb-3 block text-sm text-white/80">{key === "integrations" ? "External systems" : key === "migration" ? "Existing website and content" : key === "projectType" ? "Project type" : key === "interaction" ? "Visitor journey" : "Content structure"}</label><Select value={answers[key] || undefined} onValueChange={value => update(key, value as FitAnswers[typeof key])}><SelectTrigger className="data-[placeholder]:text-white/65" id={`fit-${key}`} aria-labelledby={`fit-${key}-label`} aria-describedby={`fit-${key}-hint${questionError ? " fit-error" : ""}`} aria-invalid={Boolean(questionError && !answers[key])}><SelectValue placeholder="Choose an answer">{answers[key] && fitLabel(key, answers[key])}</SelectValue></SelectTrigger><SelectContent>{FIT_OPTIONS[key].map(option => <SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}</SelectContent></Select><p id={`fit-${key}-hint`} className="mt-3 text-sm leading-6 text-white/75">{FIT_OPTIONS[key].find(option => option.value === answers[key])?.detail || "Not sure? Choose that option and we’ll review it together."}</p></div>)}</div>
            {questionError && <p id="fit-error" role="alert" className="mt-5 text-sm text-red-200">{questionError}</p>}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6"><button type="button" disabled={question === 0} onClick={() => moveQuestion(question - 1)} className={`inline-flex min-h-12 items-center gap-2 text-sm text-white/80 disabled:opacity-40 ${FOCUS}`}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button><Button size="lg" className="max-w-full px-5" onClick={advance}>{question === 3 ? "See my recommendation" : "Next question"}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Button></div>
          </motion.div>}
        </div>)}</div>

      </div>
    </Container></section>

    <section id="route" hidden={!hasResult} className={`scroll-mt-24 py-16 sm:py-24 motion-safe:transition-all motion-safe:duration-500 ${hasResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}><Container>
      <p className={`${LABEL} text-accent`}>Your recommended next step</p><h2 id="route-heading" tabIndex={-1} className={`mt-5 outline-none ${HEADING}`}>{result.application ? "Let’s scope the application." : result.uncertain ? "Let’s clarify the scope." : offer.label}</h2>
      <p role="status" className="sr-only">{hasResult ? `Recommendation: ${result.needsReview ? "scope review needed" : offer.label}. ${confirmed ? "Answers confirmed." : "Answers changed; confirm them again before sending."}` : ""}</p>
      <div className="mt-7 grid gap-8 lg:grid-cols-2"><div><ul className="space-y-3">{result.reasons.map(reason => <li key={reason} className="border-l border-accent/50 pl-4 text-base leading-7 text-white/85">{reason}</li>)}</ul>
        {!result.needsReview && <dl className="mt-7 grid grid-cols-2 gap-4"><div><dt className={LABEL}>Starting at · {currency}</dt><dd className="mt-2 font-mono text-2xl">{formatOfferPrice(result.path, currency)}</dd></div><div><dt className={LABEL}>Typical delivery</dt><dd className="mt-2 font-mono text-lg">{offer.timeline}</dd></div></dl>}
        {result.needsReview && <p className="mt-6 text-base leading-7 text-white/75">We’ll establish the right approach, budget, and schedule after reviewing your requirements. The published website estimates do not apply to an application.</p>}
        {!confirmed && <p className="mt-5 text-sm text-accent">Your choices changed. Review and confirm the updated summary before continuing.</p>}
        <div className="mt-7 flex flex-wrap gap-4"><Button className="max-w-full px-5" disabled={!complete} size="lg" onClick={() => { setConfirmed(true); go("inquiry", "inquiry-heading"); }}>{confirmed ? "Continue to your brief" : "Confirm and continue"}<ArrowRight aria-hidden="true" className="ml-3 h-4 w-4" /></Button><button type="button" onClick={() => { moveQuestion(0); }} className={`min-h-12 text-sm underline underline-offset-4 ${FOCUS}`}>Edit requirements</button></div>
      </div><div><h3 className="text-xl font-semibold">{result.needsReview ? "What we’ll establish" : "Included in this approach"}</h3><ul className="mt-4 space-y-3">{(result.needsReview ? ["The website or application boundary", "The core journey and content model", "The right delivery route and budget", "Responsibilities and a realistic schedule"] : offer.includes).map(line => <li key={line} className="border-b border-white/15 pb-3 text-base text-white/80">{line}</li>)}</ul><p className="mt-5 text-sm leading-6 text-white/75">Your proposal defines page count, content preparation, editing tools, revisions, migration, support, taxes, and third-party costs. Nothing is fixed by this fit check.</p></div></div>
      <details className="mt-8 border-y border-white/15 py-4"><summary className={`cursor-pointer text-base ${FOCUS}`}>Review your selections{direction ? ` / ${direction.short}` : ""}</summary><dl className="mt-4 grid gap-4 sm:grid-cols-2">{Object.entries(answers).map(([key, value]) => <div key={key}><dt className="text-sm text-white/70">{{ projectType: "Project", interaction: "Visitor journey", content: "Content", integrations: "Connections", migration: "Migration" }[key]}</dt><dd className="mt-1 text-base">{fitLabel(key as keyof FitAnswers, value)}</dd></div>)}</dl><p className="mt-4 text-sm text-white/75">Preferred approach: {OFFERS[requested].shortLabel}. {direction ? `Direction: ${direction.title}.` : "No visual direction attached."}</p></details>
    </Container></section>

    <section id="inquiry" hidden={!hasResult} className={`scroll-mt-24 pt-16 sm:pt-24 motion-safe:transition-all motion-safe:duration-500 ${hasResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}><Container>
      <p className={LABEL}>Your project brief</p><h2 id="inquiry-heading" tabIndex={-1} className={`mt-5 outline-none ${HEADING}`}>Tell us what comes next.</h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><aside><p className="mt-4 text-base leading-7 text-white/75">We review your goals and requirements, then reply by email with the next step. Discovery confirms final scope, cost, and availability.</p><a href="mailto:echo11.labs@gmail.com" className={`mt-5 inline-flex min-h-11 break-words text-sm underline underline-offset-4 ${FOCUS}`}>Prefer email? echo11.labs@gmail.com</a><button type="button" onClick={() => go("route", "route-heading")} className={`mt-3 block min-h-11 text-sm underline underline-offset-4 ${FOCUS}`}>Review the recommendation</button></aside><div className="min-w-0">{!confirmed && <div className="mb-6 border-l-2 border-accent bg-white/[0.03] p-4 text-white/90"><p className="text-sm leading-6">Your requirements changed. Review the updated recommendation above, or confirm your choices here to unlock the brief.</p><div className="mt-3 flex flex-wrap items-center gap-4"><Button type="button" size="sm" onClick={() => setConfirmed(true)} className="px-4 text-xs font-mono uppercase tracking-wider">Confirm and continue</Button><button type="button" onClick={() => go("route", "route-heading")} className={`text-xs text-white/70 underline underline-offset-4 hover:text-white ${FOCUS}`}>Review updated recommendation</button></div></div>}<fieldset disabled={!confirmed}><legend className="sr-only">Confirmed project brief</legend><NextStepBrief currency={currency} offerPath={result.path} projectType={answers.projectType === "unsure" || !answers.projectType ? "other" : answers.projectType} referenceProject={reference} needsReview={result.needsReview} tracking={tracking} /></fieldset></div></div>
    </Container></section>

    <section className="py-16 sm:py-24"><Container><div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><p className={LABEL}>A little clarity</p><h2 className={`mt-5 ${HEADING}`}>Before we begin.</h2><Link href="/process" className={`mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-white/75 ${FOCUS}`}>See how we work<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div><div className="border-t border-white/15">{FAQS.map(([title, answer]) => <details key={title} className="group border-b border-white/15"><summary className={`flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium marker:hidden [&::-webkit-details-marker]:hidden ${FOCUS}`}><h3>{title}</h3><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 group-open:rotate-90 group-open:text-accent" /></summary><p className="max-w-3xl pb-6 text-pretty font-sans text-[15px] leading-7 text-white/70 sm:text-base">{answer}</p></details>)}</div></div></Container></section>

    {!hasResult && <section className="py-16 sm:py-24 text-center"><Container>
      <p className={LABEL}>Next step</p>
      <h2 className="mt-4 font-sans text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Ready to find your fit?</h2>
      <p className="mx-auto mt-3 max-w-[46ch] text-pretty text-[15px] leading-7 text-white/70 sm:text-base">Take four quick steps in the fit check to compare your delivery route, starting budget, and scope.</p>
      <div className="mt-8 flex justify-center"><Button type="button" size="lg" onClick={() => go("fit-check", "fit-heading")} className="gap-3 px-6">Start the fit check<ArrowRight aria-hidden="true" className="h-4 w-4" /></Button></div>
    </Container></section>}
  </main></PageWrapper>;
}
