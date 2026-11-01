"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PageHero, HeroSecondaryLink } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import StackSpread from "@/components/ui/stack-spread";
import { EditorialWork } from "@/components/work/EditorialWork";
import { Container } from "@/components/ui/Container";
import { ProjectFeature } from "@/components/work/ProjectFeature";
import type { ProjectVariant } from "@/components/work/ProjectFeature";
import { caseStudies } from "@/data/caseStudies";
import { RevealText } from "@/components/ui/RevealText";

const EASE = [0.16, 1, 0.3, 1] as const;

const SEQUENCE: ProjectVariant[] = ["canvas", "split", "stacked", "canvas", "split", "stacked"];

/**
 * `feature` is a lead slot for the standalone showcase: rendered between the
 * spread strip and the editorial stories, so a piece that deserves the top of
 * the page (the newest live build) gets it without changing this section's own
 * heading structure.
 */
export function SelectedWork({ standalone = false, feature }: { standalone?: boolean; feature?: React.ReactNode } = {}) {
  const Heading: ElementType = standalone ? "h1" : "h2";
  const reduce = useReducedMotion();

  if (standalone) {
    return (
      <div className="relative">
        <PageHero
          copyLayout="stacked"
          kickerLeft="Echo11 / Selected work"
          kickerRight="Client projects · Studio concepts"
          title="Websites that make your business"
          highlight="easier to choose."
          description="Explore client websites engineered for clarity and studio concepts exploring new ground. Every project connects message, interface, and performance to give your business an echo."
          actions={
            <>
              <Button asChild size="lg" className="h-12 px-7 text-[13px] tracking-[0.02em]">
                <Link href="/contact" className="gap-3">
                  Start a project <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <HeroSecondaryLink href="/showcase">
                Explore the live showcase
              </HeroSecondaryLink>
            </>
          }
        >
          <StackSpread scrollLength={160} />
        </PageHero>

        {feature ? <div className="mt-14 md:mt-20">{feature}</div> : null}

        <EditorialWork excludeIds={feature ? ["forge"] : []} />
      </div>
    );
  }

  return (
    <section className="relative py-20 md:py-28">
      <Container>
        <div>
          <RevealText as={Heading} trigger="load" delay={0.15} text="Websites that make your business easier to choose." className="max-w-[16ch] font-sans text-[clamp(2.2rem,5.6vw,4.4rem)] font-bold leading-[1] tracking-[-0.04em] text-foreground" />
          <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.35, ease: EASE }} className="mt-5 max-w-[54ch] font-sans text-base leading-[1.75] text-white/70 sm:text-[17px]">
            Echo11 builds websites and brand foundations for businesses that need a stronger first impression,
            a clearer offer, and more qualified customer conversations.
          </motion.p>
        </div>
      </Container>

      <div className="mt-16 space-y-24 md:mt-24 md:space-y-36">
        {caseStudies.map((project, index) => (
          <div
            key={project.id}
          >
            <ProjectFeature
              project={project}
              variant={SEQUENCE[index % SEQUENCE.length]}
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
