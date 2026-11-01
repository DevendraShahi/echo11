"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { RevealText } from "@/components/ui/RevealText";

export function WorkCTA() {
  const reduce = useReducedMotion();

  return (
    <Container>
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-20 md:pb-16">
        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 h-px origin-left bg-white/15 md:mb-10"
          aria-hidden="true"
        />
        <RevealText
          as="h2"
          text="Have a project like these?"
          className="max-w-[18ch] font-sans text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.04] tracking-[-0.04em] text-foreground"
        />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.15 }}
        >
          <p className="mt-5 max-w-[48ch] font-sans text-base leading-[1.75] text-white/70">
            Starting your first website or improving an existing one? Tell us about your business and what your customers need.
          </p>
          <div className="mt-9">
            <Button asChild size="lg" className="group h-12 px-7 text-[13px] tracking-[0.02em]">
              <Link href="/contact">
                Book Discovery
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </Container>
  );
}
