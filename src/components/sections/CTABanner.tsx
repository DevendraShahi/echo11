"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { CornerButton } from "@/components/ui/CornerButton";
import { ArrowRight, Terminal } from "lucide-react";
import {
  createFloatAnimation,
  createPulseAnimation,
  createRevealUp,
  createScaleIn,
  createSweepAnimation,
  viewportOnce,
} from "@/lib/animations";

export function CTABanner() {
  const prefersReducedMotion = useReducedMotion();
  const shellVariants = createScaleIn(0.97, 0.75);
  const contentVariants = createRevealUp(22, 0.55);

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-black py-32 md:py-48">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,_var(--tw-gradient-stops))] from-accent/10 via-black to-black opacity-80"
        animate={createFloatAnimation(prefersReducedMotion, 12)}
        transition={{ duration: 10, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,black,transparent)]" />

      <Container className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          variants={shellVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative w-full max-w-4xl"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-none bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 blur-xl"
            animate={createPulseAnimation(prefersReducedMotion, 0.2, 0.5)}
            transition={{ duration: 3.6, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex flex-col items-center overflow-hidden rounded-none border border-white/10 bg-[#050505] p-12 text-center shadow-2xl md:p-24">
            <motion.div
              aria-hidden
              animate={createSweepAnimation(prefersReducedMotion)}
              transition={{ repeat: prefersReducedMotion ? 0 : Infinity, duration: 3.4, ease: "linear" }}
              className="absolute top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"
            />

            <motion.div
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="relative mb-8 flex h-16 w-16 items-center justify-center rounded-none border border-white/10 bg-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
              animate={createFloatAnimation(prefersReducedMotion, 6)}
              transition={{ duration: 5.6, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
            >
              <Terminal className="relative z-10 h-8 w-8 text-accent" />
            </motion.div>

            <motion.h2
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mb-8 font-sans text-4xl font-bold tracking-tight text-white md:text-7xl"
            >
              Need a clearer path <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-white via-accent/80 to-accent bg-clip-text text-transparent">
                from idea to launch?
              </span>
            </motion.h2>

            <motion.p
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mb-12 max-w-2xl font-mono text-sm leading-relaxed text-white/50 md:text-lg"
            >
              Share what you need to build, where the constraints are, and what needs to happen next. We&apos;ll help you shape a realistic scope and delivery plan.
            </motion.p>

            <motion.div
              variants={contentVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="relative z-20 flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
            >
              <CornerButton
                href="/contact"
                size="xl"
                containerClassName="w-full sm:w-auto"
                className="w-full sm:w-auto sm:min-w-[290px]"
              >
                Start the Conversation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CornerButton>
              <CornerButton
                href="mailto:echo11.labs@gmail.com"
                size="xl"
                tone="white"
                containerClassName="w-full sm:w-auto"
                className="w-full sm:w-auto sm:min-w-[190px]"
              >
                Email Team
              </CornerButton>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
