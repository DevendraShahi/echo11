"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Compass, Layers, Braces } from "lucide-react";

import { PageHero, HeroSecondaryLink } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import styles from "./AboutExperience.module.css";

const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-white/60";
const HEADING = "font-sans text-[clamp(2.1rem,4.5vw,3.8rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground";
const BODY = "text-pretty font-sans text-[15px] leading-7 text-white/70 sm:text-base";
const LINK = "group inline-flex min-h-11 items-center gap-3 text-sm text-white/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background";
const EASE = [0.16, 1, 0.3, 1] as const;

function Entrance({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: EASE }}>{children}</motion.div>;
}

function HoverTint({ src }: { src: string }) {
  return <Image aria-hidden="true" src={src} alt="" fill loading="eager" unoptimized className={`object-contain ${styles.hoverTint}`} />;
}

/** The original workshop connects strategy, design, and engineering. */
function WholePictureArtwork() {
  const reduce = useReducedMotion();
  return <figure className="min-w-0" aria-label="Conceptual 3D diorama of a connected website workshop">
    <motion.div
      className={`relative mx-auto aspect-[4/3] w-full max-w-[620px] ${styles.artwork} ${styles.perspective}`}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 1.1, ease: EASE }}
    >
      <Image
        src="/images/brand/echo11-connected-workshop-3d.jpg"
        alt="3D isometric architectural diorama: collaborators mapping strategy at a conference table, a designer pinning wireframe panels on display boards, and an engineer building responsive layouts at a dual-screen workstation, linked by a glowing cyan thread"
        fill
        loading="eager"
        unoptimized
        className="object-contain"
      />
      <HoverTint src="/images/brand/echo11-connected-workshop-3d.jpg" />
    </motion.div>
    <figcaption className="mt-6 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-4">
      <span className={LABEL}>Strategy → Design → Engineering</span>
      <span className={`${LABEL} text-white/85`}>Clear on every screen</span>
    </figcaption>
  </figure>;
}


const disciplines = [
  { title: "Think clearly.", label: "Strategy", tint: styles.strategy, icon: Compass, image: "/images/brand/echo11-strategy-think-clearly-3d.jpg", alt: "3D architectural diorama of the Echo11 strategy lounge: collaborators seated on a modern sofa and armchair mapping audience needs to page hierarchy with illuminated wireframe cards under the echo11 studio sign.", text: "Understand the people you need to reach. Define the message, page structure, and next step that give the website a reason to exist." },
  { title: "Make it distinctive.", label: "Design", tint: styles.design, icon: Layers, image: "/images/brand/echo11-design-make-it-distinctive-3d.jpg", alt: "3D architectural diorama of the Echo11 design atelier: a designer curating typography specimens, brand color swatches, and website layout panels on display walls under the echo11 / design studio beam.", text: "Translate your business into a considered visual language. Give your content hierarchy, your brand character, and your visitors a clear path." },
  { title: "Build it properly.", label: "Engineering", tint: styles.engineering, icon: Braces, image: "/images/brand/echo11-engineering-build-it-properly-3d.jpg", alt: "3D architectural diorama of the Echo11 engineering lab: an engineer testing responsive code on an ultrawide monitor with tablet and phone displays while a collaborator reviews the handover under the echo11 / engineering studio beam.", text: "Make the approved direction work across screen sizes. Choose maintainable tools, connect the agreed integrations, and hand over a website your team can run." },
];

const standards = [
  { title: "Clarity before decoration", text: "We start with what your audience needs to understand. Visual decisions should strengthen that message and make the next action easier to find." },
  { title: "Craft with a practical purpose", text: "Typography, layout, interaction, and motion work together. We give details attention because they shape how people read, navigate, and use your website." },
  { title: "Decisions you can follow", text: "You see the direction before the build and review the working site before launch. Scope, feedback, and changes stay part of a shared conversation." },
];

export function AboutExperience() {
  const reduce = useReducedMotion();
  return <main className="pb-20">
    <PageHero
      copyLayout="stacked"
      kickerLeft="About us / Echo11 studio"
      titleId="studio-heading"
      title="Clear thinking."
      highlight="Distinctive work."
      description="We’re Echo11, a website studio. We bring strategy, design, and engineering together to help businesses explain their offer, build credibility, and give people a reason to choose them."
      actions={
        <>
          <Button asChild size="lg" className="h-12 px-7 text-[13px] tracking-[0.02em]">
            <Link href="/contact" className="gap-3">
              Start a conversation
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <HeroSecondaryLink href="/work">
            Meet us through the work
          </HeroSecondaryLink>
        </>
      }
    />

    <Container>

      <section aria-labelledby="perspective-heading" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div><p className={LABEL}>Our perspective</p><h2 id="perspective-heading" className={`${HEADING} mt-5 max-w-[17ch]`}>The whole picture.<br />Down to the details.</h2><p className={`${BODY} mt-6 max-w-[48ch]`}>A website is often where someone decides whether your business is right for them. It needs to do more than look good: it needs to make your offer understandable, your expertise credible, and the next step clear.</p><p className={`${BODY} mt-4 max-w-[48ch]`}>That’s why we connect the thinking, the interface, and the build from the start. Each discipline informs the others, so the finished experience feels like one considered whole.</p></div>
        <WholePictureArtwork />
      </section>

      <section aria-labelledby="approach-heading" className="border-t border-white/15 py-16 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-20"><div><p className={LABEL}>One connected approach</p><h2 id="approach-heading" className={`${HEADING} mt-5`}>Thought through.<br />Carried through.</h2></div><p className={`${BODY} max-w-[48ch] lg:self-end`}>From the first questions to the final handover, we connect business intent with the way a website looks, works, and grows with your content.</p></div>
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {disciplines.map((item, index) => (
            <Entrance key={item.label} delay={index * 0.08} className="min-w-0 border-t border-white/20 pt-6">
              <div className="flex items-center justify-between">
                <p className={LABEL}>0{index + 1} / {item.label}</p>
                <item.icon aria-hidden="true" strokeWidth={1.25} className="h-6 w-6 text-white/60" />
              </div>
              <div className={`relative mx-auto mt-6 aspect-[4/3] w-full max-w-[480px] ${styles.artwork} ${item.tint}`}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  loading="eager"
                  unoptimized
                  sizes="(min-width: 1280px) 380px, (min-width: 768px) 30vw, (min-width: 528px) 480px, calc(100vw - 48px)"
                  className="object-contain"
                />
                <HoverTint src={item.image} />
              </div>
              <h3 className="mt-7 font-sans text-[clamp(1.55rem,2.3vw,2rem)] font-semibold leading-tight tracking-[-0.035em] text-white">{item.title}</h3>
              <p className={`${BODY} mt-4`}>{item.text}</p>
            </Entrance>
          ))}
        </div>
        <Link href="/services" className={`${LINK} mt-8`}>Explore our services<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" /></Link>
      </section>

      <section aria-labelledby="standards-heading" className="grid gap-10 border-t border-white/15 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <motion.figure
          className={`relative aspect-[1376/768] w-full min-w-0 lg:col-span-2 ${styles.artwork} ${styles.standards}`}
          aria-label="3D architectural diorama of the Echo11 studio standards"
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reduce ? 0 : 1, ease: EASE }}
        >
          <Image
            src="/images/brand/echo11-standards-banner-3d.jpg"
            alt="3D architectural diorama: connected open studio terraces for strategy planning, typography and wireframe curation on glass partitions under the echo11 tower, and responsive code development."
            fill
            loading="eager"
            unoptimized
            className="object-contain"
          />
          <HoverTint src="/images/brand/echo11-standards-banner-3d.jpg" />
        </motion.figure>
        <div><p className={LABEL}>What we stand for</p><h2 id="standards-heading" className={`${HEADING} mt-5 max-w-[15ch]`}>Care you can see.<br />Decisions you can trust.</h2><p className={`${BODY} mt-5 max-w-[40ch]`}>Good work comes from consistent choices. These are the principles we bring to the brief, the design, and the delivery.</p><Link href="/process" className={`${LINK} mt-6`}>How we work<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
        <div className="border-t border-white/15">{standards.map((item, index) => <Entrance key={item.title} className="grid grid-cols-[1.5rem_1fr] gap-4 border-b border-white/15 py-6"><span aria-hidden="true" className="pt-1 font-mono text-[10px] text-white/55">0{index + 1}</span><div><h3 className="font-sans text-xl font-semibold tracking-tight text-white">{item.title}</h3><p className={`${BODY} mt-3`}>{item.text}</p></div></Entrance>)}</div>
      </section>

      <section aria-labelledby="fit-heading" className="grid gap-10 border-t border-white/15 py-16 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div><p className={LABEL}>Who we work with</p><h2 id="fit-heading" className={`${HEADING} mt-5 max-w-[17ch]`}>A business with something worth saying.</h2></div>
        <div><p className={`${BODY} text-white/85`}>You might be launching an offer, building confidence in an established business, or replacing a website that no longer reflects where you’re going.</p><p className={`${BODY} mt-4`}>We work with service businesses, product teams, and brands that need a clearer website. The strongest collaborations pair your knowledge of the business with our attention to the website.</p><Link href="/make-it-yours" className={`${LINK} mt-6`}>Find your starting point<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      </section>

      <section aria-labelledby="conversation-heading" className="relative border-t border-white/15 pb-5 pt-16 sm:pt-24">
        <motion.span aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-accent/60" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1, ease: EASE }} />
        <p className={LABEL}>Let’s make it clear</p><h2 id="conversation-heading" className="mt-6 max-w-[19ch] font-sans text-[clamp(2.8rem,6.7vw,6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">Your next chapter.<br /><span className="text-white/55">A stronger expression.</span></h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><p className={`${BODY} max-w-[48ch]`}>Tell us where your business is heading and what the website needs to make possible. We’ll review your inquiry and reply with the next step.</p><Button asChild size="lg" className="w-fit"><Link href="/contact" className="gap-3">Start a conversation<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></Button></div>
      </section>
    </Container>
  </main>;
}
