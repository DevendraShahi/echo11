"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/data/faqs";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section className="relative bg-black border-t border-white/5 py-24 md:py-32">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 bg-accent/[0.04] blur-[120px]" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 md:mb-20"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Common questions
          </p>
          <h2 className="max-w-2xl font-sans text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            What teams ask before working with us.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 divide-y divide-white/5 border-y border-white/5"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div key={index} variants={itemVariants}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="group flex w-full items-start justify-between gap-8 py-7 text-left transition-colors duration-300 hover:text-white"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-sans text-base font-semibold leading-snug tracking-tight transition-colors duration-300 md:text-lg ${
                      isOpen ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center border transition-all duration-300 ${
                      isOpen
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-white/10 text-white/30 group-hover:border-white/30 group-hover:text-white/60"
                    }`}
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-7 pr-10 font-mono text-sm leading-relaxed text-white/50 md:max-w-3xl">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
