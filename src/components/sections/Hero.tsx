"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { CornerButton } from "@/components/ui/CornerButton";
import { ArrowRight } from "lucide-react";

import { WavesBackground } from "@/components/ui/WavesBackground";

const TITLE = "Plan, design, and build software your business can rely on.";

const sentenceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ease: [0.25, 0.1, 0.25, 1], duration: 0.5 },
  },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section 
      ref={ref} 
      className="relative flex min-h-[90vh] items-center pt-24 pb-16 overflow-hidden"
    >
      {/* GitHub-style ambient waves background */}
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen mask-image-bottom">
        <WavesBackground className="w-full h-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <motion.div style={{ opacity, y }} className="w-full relative z-20">
        <Container>
          <div className="flex flex-col items-center text-center">
            {/* Badge removed per user request */}

            <motion.h1 
              variants={sentenceVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground font-sans leading-[1.1] mb-8"
            >
              {TITLE.split(" ").map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-[0.3em] last:mr-0">
                  {word.split("").map((char, charIndex) => (
                    <motion.span 
                      key={`${wordIndex}-${charIndex}`}
                      variants={letterVariants}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="max-w-2xl text-lg sm:text-lg text-white/50 mb-12 font-mono font-medium tracking-wide"
            >
              Echo11 helps founders and growing teams turn messy digital requirements into clear websites, product platforms, portals, and internal tools.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <CornerButton
                href="/contact"
                size="xl"
                containerClassName="w-full sm:w-auto"
                className="w-full min-w-0 sm:w-auto sm:min-w-[320px]"
              >
                TALK THROUGH A PROJECT
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CornerButton>
              <CornerButton
                href="/work"
                size="xl"
                tone="white"
                containerClassName="w-full sm:w-auto"
                className="w-full min-w-0 sm:w-auto sm:min-w-[260px]"
              >
                VIEW CURRENT WORK
              </CornerButton>
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
