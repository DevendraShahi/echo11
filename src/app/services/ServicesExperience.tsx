"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PageHero, HeroSecondaryLink } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

import { ServiceArtwork } from "./ServiceArtwork";

const EASE = [0.16, 1, 0.3, 1] as const;
const HEADING = "max-w-[23ch] font-sans text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.045em]";
const META = "font-mono text-[10px] uppercase tracking-[0.18em] leading-5";
const LABEL = `${META} text-white/60`;
const LINK = "group inline-flex items-center gap-3 border-b border-border pb-1.5 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const services = [
  {
    id: "business-websites", title: "Business websites", start: "I need my first website.",
    summary: "Establish a credible presence and make your business easy to understand.",
    promise: "Turn what you do into a clear reason to choose you.",
    audience: "Businesses ready for their first website, or a stronger home for their offer.",
    change: "Customers can understand what you offer, see why it matters, and find a direct way to get in touch.",
    deliverables: ["Audience and offer alignment", "Page structure and content direction", "Brand presentation and interface design", "Responsive website build with accessible navigation", "Performance and technical search foundations", "Inquiry or booking integration and agreed analytics"],
    inquiry: "/contact?project=service", cta: "Discuss a business website",
  },
  {
    id: "website-redesigns", title: "Website redesigns", start: "My website needs to work harder.",
    summary: "Improve clarity, mobile experience, and the path to an inquiry.",
    promise: "Remove the friction between interest and action.",
    audience: "Businesses with a website that no longer reflects their quality, offer, or ambition.",
    change: "Customers spend less time figuring out the site and more time finding the information they need to decide.",
    deliverables: ["Existing website and journey review", "Content and navigation improvements", "Redesigned responsive interfaces", "A rebuild or targeted improvements", "Migration and launch planning"],
    inquiry: "/contact?project=service", cta: "Discuss your existing website",
  },
  {
    id: "online-stores", title: "Online stores", start: "I want to sell online.",
    summary: "Help customers discover your products and move toward checkout.",
    promise: "Give good products a considered shopping experience.",
    audience: "Product businesses starting online or improving the way their catalogue is shopped.",
    change: "Customers can explore the range, understand the products, and move through a clear purchase journey.",
    deliverables: ["Catalogue and category structure", "Product page design and content", "Consistent brand presentation", "Cart and checkout configuration", "Platform and payment integrations"],
    inquiry: "/contact?project=ecommerce", cta: "Discuss an online store",
  },
];

const faqs = [
  ["Can we start without a website or complete brand identity?", "Yes. We start with your business, customers, and offer. We can shape the messaging and visual direction needed for the website, and agree what content and assets need to be prepared before the build."],
  ["Can you work with our current website?", "Yes. We review the existing site, its content, and the systems it relies on before recommending targeted improvements or a rebuild. Any migration needs and launch arrangements are agreed as part of the scope."],
];

function Entrance({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: EASE }} className={`motion-reduce:!transform-none motion-reduce:!opacity-100 ${className}`}>{children}</motion.div>;
}
function SectionHeading({ label, title }: { label: string; title: string }) {
  return <div><p className={`${LABEL} mb-5`}>{label}</p><h2 className={HEADING}>{title}</h2></div>;
}
function Cue({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={LINK}>{children}<ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5" /></Link>;
}

function CustomerJourney() {
  const reduce = useReducedMotion();
  const journey = [
    ["Discover", "Find your business and recognise what you offer."],
    ["Understand", "See who it is for and how it meets their needs."],
    ["Trust", "Explore relevant work, clear scope, and useful answers."],
    ["Act", "Reach an inquiry, booking, or purchase without a detour."],
  ];
  return <div className="border-t border-border pt-8 md:pt-10">
    <p className={`${LABEL} mb-8`}>A considered path for your customers</p>
    <div className="relative">
      <motion.div aria-hidden="true" initial={reduce ? false : { scaleX: 0, scaleY: 0 }} whileInView={{ scaleX: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : .9, ease: EASE }} className="absolute left-0 top-0 h-full w-px origin-top bg-border motion-reduce:!transform-none md:h-px md:w-full md:origin-left" />
      <motion.ol initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: .2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: .1 } } }} className="grid gap-8 md:grid-cols-4 md:gap-8">
        {journey.map(([title, description], i) => <motion.li key={title} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : .5, ease: EASE }} className="relative pl-6 md:pl-0 md:pt-6 motion-reduce:!transform-none motion-reduce:!opacity-100">
          <span aria-hidden="true" className="absolute left-0 top-2 h-px w-3 bg-accent md:top-0 md:h-3 md:w-px" />
          <p className="text-lg font-semibold tracking-tight sm:text-xl"><span className="mr-3 font-mono text-[10px] font-normal text-white/60">0{i + 1}</span>{title}</p>
          <p className="mt-3 max-w-[30ch] text-[14px] leading-6 text-white/70">{description}</p>
        </motion.li>)}
      </motion.ol>
    </div>
  </div>;
}


function ClosingSection() {
  const reduce = useReducedMotion();
  return <section id="next-chapter" aria-labelledby="services-invitation" className="relative scroll-mt-28 border-t border-border py-16 md:py-24">
    <div className="flex items-center justify-between gap-6">
      <p className={LABEL}>Your next chapter</p>
      <span className={`${LABEL} hidden sm:block`}>A conversation comes first</span>
    </div>
    <div className="mt-10 md:mt-14">
      <h2 id="services-invitation" className="font-sans text-[clamp(2.8rem,7.6vw,7.2rem)] font-semibold leading-[1.04] tracking-[-0.055em]">
        Your next move.<br /><span className="text-white/55">Let’s build for it.</span>
      </h2>
    </div>
    <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
      <Entrance>
        <p className="max-w-[44ch] text-pretty text-base leading-7 text-white/75 sm:text-[17px]">A clearer offer. A stronger first impression. A better way to buy. Tell us what needs to change, and we’ll help shape the website around it.</p>
        <div className="mt-7 border-l border-border pl-5">
          <p className={LABEL}>Bring what you have</p>
          <p className="mt-2 max-w-[44ch] text-sm leading-6 text-white/65">Your goal, your current website if you have one, and any timing or budget in mind. An early idea is enough to begin.</p>
        </div>
      </Entrance>
      <Entrance delay={0.12}>
        <motion.div whileHover={reduce ? undefined : "hover"}>
          <Link href="/contact" className="group flex min-h-[100px] items-center justify-between gap-6 border-y border-border py-7 text-white transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:min-h-[120px]" data-cursor="Let’s talk">
            <span className="text-[clamp(1.8rem,3vw,2.8rem)] font-semibold tracking-[-0.04em]">Start a project</span>
            <motion.span aria-hidden="true" variants={{ hover: { x: 5, y: -5 } }} transition={{ duration: .3, ease: EASE }} className="shrink-0"><ArrowUpRight className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.25} /></motion.span>
          </Link>
        </motion.div>
        <p className="mt-5 text-sm leading-6 text-white/60">We’ll review your inquiry and reply with the next step.</p>
      </Entrance>
    </div>
    <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 md:mt-14">
      <p className={LABEL}>Strategy / Design / Engineering</p>
      <Cue href="/work">See what we’ve built</Cue>
    </div>
  </section>;
}


type WebsiteService = (typeof services)[number];
function ServiceAudience({ service }: { service: WebsiteService }) {
  return <dl className="space-y-6"><div><dt className={LABEL}>Who it suits</dt><dd className="mt-2 text-pretty text-[15px] leading-7 text-white/75">{service.audience}</dd></div><div><dt className={LABEL}>What changes for customers</dt><dd className="mt-2 text-pretty text-[15px] leading-7 text-white/75">{service.change}</dd></div></dl>;
}
function ServiceScope({ service }: { service: WebsiteService }) {
  return <div><p className={LABEL}>What Echo11 delivers</p><ul className="mt-4 space-y-3">{service.deliverables.map(item => <li key={item} className="border-l border-border pl-4 text-[14px] leading-6 text-white/75">{item}</li>)}</ul><div className="mt-8"><Cue href={service.inquiry}>{service.cta}</Cue></div></div>;
}
function ServiceArticle({ service, index }: { service: WebsiteService; index: number }) {
  const heading = <div><p className={`${LABEL} mb-5`}>0{index + 1} / {service.title}</p><h3 className="max-w-[24ch] text-[clamp(1.75rem,3vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.035em]">{service.promise}</h3></div>;
  return <article id={service.id} className="scroll-mt-28 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
    <div>{heading}<Entrance className="mt-6 space-y-8"><ServiceAudience service={service} /><ServiceScope service={service} /></Entrance></div>
    <ServiceArtwork index={index} glow />
  </article>;
}


export function ServicesExperience() {
  return (
    <main className="relative pb-16 font-sans text-foreground md:pb-24">
      <PageHero
        copyLayout="stacked"
        kickerLeft="Echo11 / Website services"
        kickerRight="Strategy · Design · Engineering"
        title="A website that moves your"
        highlight="business forward."
        description="A first website, a thoughtful redesign, or an online store. We connect your offer, your brand, and the technology behind it so customers know why to choose you."
        actions={
          <>
            <Button asChild size="lg" className="h-12 px-7 text-[13px] tracking-[0.02em]">
              <Link href="/contact" className="gap-3">
                Discuss your website
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
            <HeroSecondaryLink href="#starting-points" icon="down">
              Explore the 3 services
            </HeroSecondaryLink>
          </>
        }
      >
        <CustomerJourney />
      </PageHero>

      <Container>
        <section id="starting-points" className="scroll-mt-28 border-t border-border py-16 md:py-24" aria-label="Services and deliverables">
        <SectionHeading label="The services" title="Start with what your business needs." />
        <nav aria-label="Choose a website service" className="mt-10 grid gap-8 border-b border-border pb-12 md:grid-cols-3">
          {services.map((service, i) => <div key={service.id} className="border-t border-border pt-5"><div className="mb-5 max-w-[120px]"><ServiceArtwork index={i} compact glow /></div><Cue href={`#${service.id}`}>{service.title}</Cue></div>)}
        </nav>
        <div className="mt-14 space-y-14 md:mt-14 md:space-y-20">
          {services.map((service, i) => <ServiceArticle key={service.id} service={service} index={i} />)}
        </div>
      </section>

      <nav aria-label="Explore the work and delivery" className="flex flex-wrap gap-x-10 gap-y-5 border-t border-border py-8"><Cue href="/work">Explore relevant projects</Cue><Cue href="/process">See delivery and handover</Cue><Cue href="/make-it-yours">Compare approaches and pricing</Cue></nav>

      <section className="border-t border-border py-16 md:py-24">
        <SectionHeading label="Before we begin" title="A few useful answers." />
        <div className="mt-10 border-t border-border">
          {faqs.map(([question, answer], i) => <Entrance key={question} delay={i * 0.09} className="grid gap-2 border-b border-border py-7 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <h3 className="text-lg font-semibold leading-7">{question}</h3>
            <p className="text-pretty text-[15px] leading-7 text-white/70">{answer}</p>
          </Entrance>)}
        </div>
      </section>

      <ClosingSection />
    </Container>
  </main>
  );
}
