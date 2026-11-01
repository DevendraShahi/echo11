"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";
import { HomeProcessExperience } from "@/components/sections/HomeProcessExperience";
import { EASE_OUT } from "@/lib/animations";
import { gsap } from "@/lib/gsap";
import { OFFERS } from "@/lib/website-offers";
import { cn } from "@/lib/utils";

/**
 * One stage of a project, written for the person paying for it: what happens,
 * what exists at the end of it, and the single thing we need from them to move
 * on. `youGet` is drawn from the two published scopes in `website-offers.ts`, so
 * this section cannot promise a deliverable the offer does not already include.
 *
 * `num` renders here as the stage's ghost numeral beside the spine, and
 * `/services` prints it beside the stage names.
 */
export interface DeliveryStage {
  num: string;
  title: string;
  does: string;
  youGet: string[];
  fromYou: string;
}

export const steps: DeliveryStage[] = [
  {
    num: "01",
    title: "Discovery and architecture",
    does: "We agree what the site has to do, what it has to contain, and how we will know it worked.",
    youGet: ["A written scope and page map", "The content, integration, and decision list"],
    fromYou: "One call, and access to the content you already have.",
  },
  {
    num: "02",
    title: "Design and interaction",
    does: "You see the direction and the page system before anything is built.",
    youGet: [
      "A visual direction you approve",
      "The responsive page system",
      "The rules that keep later pages consistent",
    ],
    fromYou: "One round of feedback on the direction.",
  },
  {
    num: "03",
    title: "Website engineering",
    does: "We build the site, wire its content and integrations, and keep the code readable and typed.",
    youGet: ["The build, wired to its content and integrations", "The content structure, ready to edit"],
    fromYou: "Nothing, until we show you the built site.",
  },
  {
    num: "04",
    title: "Launch and handover",
    does: "We put it live, watch the first days, and hand over everything it runs on.",
    youGet: ["QA, analytics, and the launch", "The code, the content structure, and the accounts"],
    fromYou: "Your domain, and the accounts we launch into.",
  },
];

/** The two published scopes and how long each one runs, read from the offer data. */
const PATHS = [
  { id: "foundation" as const, label: OFFERS.foundation.shortLabel, timeline: OFFERS.foundation.timeline },
  { id: "custom" as const, label: OFFERS.custom.shortLabel, timeline: OFFERS.custom.timeline },
];

const CUE =
  "group/cue inline-flex items-center gap-2 font-sans text-[14px] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Ghost numeral: transparent fill under a light stroke at rest, solid white
 * once the spine reaches the stage, accent under the pointer. Same outline
 * language as the Capabilities wall; the stroke transition rides on `color`.
 */
const NUMERAL =
  "select-none font-sans font-bold leading-none tracking-[-0.05em] text-[clamp(3rem,6vw,5rem)] [-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

/**
 * The spine itself lives in the gutter between the numeral column and the
 * stage column (half the grid gap either side of the content edge), and each
 * stage's tick sits on it, centred on the stage title's first line.
 */
const SPINE = "pointer-events-none absolute top-0 bottom-0 left-[4.625rem] w-px md:left-[8.25rem]";

const TICK =
  "pointer-events-none absolute left-[-0.625rem] top-[0.55em] h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 border-[1.5px] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:left-[-1.25rem]";

/**
 * "How a project runs" — the delivery spine.
 *
 * A 1px track runs down the gutter beside four ghost numerals; a GSAP
 * ScrollTrigger scrub (the house-reserved scroll choreography) draws its fill
 * as the list passes, and each stage's tick and numeral ignite when the drawn
 * tip reaches them. The three data roles read as three voices: `does` is the
 * body, `youGet` is a "You keep" list with quiet plus marks, `fromYou` sits
 * under a hairline behind a mono label.
 *
 * Motion ownership: GSAP owns the scrub and the word reveals (`RevealText` on
 * the heading and every stage title); framer-motion owns the entry choreography
 * (house cue: y24 + blur6 → 0, 800ms, stagger .08 / delay .45); CSS owns hover
 * (accent on tick, numeral, and plus marks). Reduced motion renders the spine
 * pre-drawn with every stage lit, static.
 *
 * The homepage uses a concise overview; `standalone` keeps the detailed
 * delivery spine on `/process`. Published durations share the offer data.
 */
export function ProcessTimeline({ standalone = false }: { standalone?: boolean } = {}) {
  return standalone ? <DetailedProcessTimeline standalone /> : <HomeProcessExperience />;
}

function DetailedProcessTimeline({ standalone = true }: { standalone?: boolean }) {
  const reduce = useReducedMotion();
  const Heading = standalone ? "h1" : "h2";
  const StageHeading = standalone ? "h2" : "h3";
  const displaySteps = steps;

  const stageRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [lit, setLit] = useState(0);

  /**
   * Draw the spine and light the stages the tip has passed. Ticks are measured
   * through the offsetParent chain (layout positions), so the framer entry
   * transforms on the rows never skew a threshold. Match media is
   * authoritative: a reduced-motion visitor gets the end state — spine drawn,
   * all stages lit — without the timeline ever engaging.
   */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (fillRef.current) fillRef.current.style.transform = "scaleY(1)";
      setLit(steps.length);
      return;
    }
    const wrap = stageRef.current;
    const fill = fillRef.current;
    if (!wrap || !fill) return;

    const ctx = gsap.context(() => {
      const ticks = Array.from(wrap.querySelectorAll<HTMLElement>("[data-tick]"));
      let offsets: number[] = [];

      const measure = () => {
        offsets = ticks.map((tick) => {
          let y = 0;
          for (let node: HTMLElement | null = tick; node && node !== wrap; node = node.offsetParent as HTMLElement | null) {
            y += node.offsetTop;
          }
          return y + tick.offsetHeight / 2;
        });
      };

      let reached = 0;
      const apply = (progress: number) => {
        const tip = progress * wrap.offsetHeight;
        let next = 0;
        while (next < offsets.length && offsets[next] <= tip) next += 1;
        if (next !== reached) {
          reached = next;
          setLit(next);
        }
      };

      measure();
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 72%",
            end: "bottom 58%",
            scrub: true,
            onRefresh: (self) => {
              measure();
              apply(self.progress);
            },
            onUpdate: (self) => apply(self.progress),
          },
        },
      );
    }, wrap);

    return () => ctx.revert();
  }, []);

  const listV: Variants = reduce
    ? { hidden: {}, visible: {} }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } } };

  const rowV: Variants = reduce
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
    <section
      id="process"
      className={cn(
        "relative",
        standalone
          ? "overflow-hidden py-16"
          : "overflow-hidden py-20 md:py-28 lg:py-32",
      )}
    >
      <Container>
        {/* Claim beside its mono meta line — deliberately not the
            heading-plus-paragraph band the sibling sections share. */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <RevealText
            as={Heading}
            text={standalone ? "How a project runs." : "Know what happens next."}
            trigger="view"
            blur={4}
            className="font-sans text-[clamp(2.2rem,4.4vw,3.4rem)] font-bold leading-[1.06] tracking-[-0.04em] text-foreground"
          />
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
          >
            {standalone ? "Four stages · Two paths · Same order" : "Clear deliverables · Shared decisions · Your ownership"}
          </motion.p>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
          className="mt-6 max-w-[58ch] font-sans text-base leading-7 text-white/55 sm:text-[17px]"
        >
          {standalone
            ? "Four stages, always in the same order. Each one ends in something you keep, and each one says what we need from you next."
            : "From the first conversation to handover, you know what we are working on, what you receive, and where your input is needed."}
        </motion.p>

        <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-20">
          {/* The two published scopes, so the timelines and the stages meet. The
              prices stay in the offer section, where the currency lives. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT, delay: 0.06 }}
            className="relative border-y border-white/[0.08] py-6 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-10 lg:sticky lg:top-24 lg:block lg:border-y-0 lg:py-0 lg:self-start"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{standalone ? "Choose your starting point" : "A scope that fits"}</p>
              <p className="mt-2 max-w-[22ch] font-sans text-[15px] leading-6 text-white/65">{standalone ? "Same working order. A different level of intervention." : "Foundation adapts an established page system. Custom starts with your specific requirements."}</p>
            </div>
            <div className="mt-5 sm:mt-0 lg:mt-7">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
              {PATHS.map((path) => (
                <div key={path.id} className="border-l border-white/20 pl-3 transition-colors duration-300 hover:border-accent">
                  <dt className="font-sans text-[15px] font-semibold tracking-[-0.015em] text-white">{path.label}</dt>
                  <dd className="mt-1 font-sans text-[13px] leading-5 text-white/45">
                    {path.timeline} {standalone ? "from kickoff to launch" : "typical delivery"}
                  </dd>
                </div>
              ))}
            </dl>
            <Link href="/make-it-yours" className={`${CUE} mt-7`}>
              <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/cue:border-white/70">
                {standalone ? "See what each one includes" : "Compare the scopes"}
              </span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cue:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            </div>
          </motion.div>

          <div ref={stageRef} className="relative">
            {/* The track reads at rest; the fill is the scrubbed draw. Both sit
                under the rows, so ticks and type paint over them. */}
            <span aria-hidden="true" className={cn(SPINE, "bg-white/10")} />
            <span
              aria-hidden="true"
              ref={fillRef}
              style={{ transform: "scaleY(0)" }}
              className={cn(SPINE, "origin-top bg-white/40")}
            />

            <motion.ol
              className="flex flex-col gap-10 md:gap-16"
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listV}
            >
              {displaySteps.map((stage, index) => {
                const isLit = index < lit;
                return (
                  <motion.li
                    key={stage.num}
                    variants={rowV}
                    aria-current={isLit && index === lit - 1 ? "step" : undefined}
                    className="group/stage"
                  >
                    <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-5 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-x-10">
                      <div className="flex justify-end pt-1">
                        <span
                          aria-hidden="true"
                          className={cn(NUMERAL, isLit ? "text-white" : "text-transparent")}
                        >
                          {stage.num}
                        </span>
                      </div>

                      <div>
                        <StageHeading className="relative font-sans text-[1.5rem] font-bold leading-[1.12] tracking-[-0.03em] text-white sm:text-[1.75rem]">
                          <span
                            aria-hidden="true"
                            data-tick
                            className={cn(
                              TICK,
                              isLit ? "border-white bg-white" : "border-white/45",
                              "group-hover/stage:border-accent group-hover/stage:bg-accent",
                            )}
                          />
                          <RevealText as="span" text={stage.title} trigger="view" blur={3} />
                        </StageHeading>

                        <div className="mt-4 grid gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
                          <p className="max-w-[54ch] font-sans text-[15px] leading-7 text-white/60 sm:text-[16px]">
                            {stage.does}
                          </p>

                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
                              You keep
                            </p>
                            <ul className="mt-3 flex flex-col gap-2">
                              {stage.youGet.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-2.5 font-sans text-[14px] leading-6 text-white/70"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="font-mono text-white/30 transition-colors duration-500 group-hover/stage:text-accent"
                                  >
                                    +
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/[0.09] pt-3">
                          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                            From you
                          </p>
                          <p className="mt-1.5 max-w-[46ch] font-sans text-[13px] leading-6 text-white/45">
                            {stage.fromYou}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
