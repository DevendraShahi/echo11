"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealText } from "@/components/ui/RevealText";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The one big statement of the page. The line itself rides the house word
 * reveal (GSAP); the support sentence settles underneath with framer-motion,
 * so the two never target the same nodes.
 */
export function Statement() {
  const reduce = useReducedMotion();

  return (
    <section className="relative py-20 md:py-32">
      <Container className="text-center">
        <RevealText
          as="h2"
          text="Give people a reason to choose you."
          trigger="view"
          blur={5}
          stagger={0.07}
          className="mx-auto max-w-[15ch] font-sans text-[clamp(2.4rem,5.6vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.04em] text-foreground text-balance"
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-7 max-w-[44ch] font-sans text-[15px] leading-[1.75] text-white/70 sm:text-[17px]"
        >
          We connect your message, visual identity, and website engineering so visitors understand your offer and know what to do next.
        </motion.p>

      </Container>
    </section>
  );
}
