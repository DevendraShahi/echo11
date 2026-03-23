"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WavesBackground } from "@/components/ui/WavesBackground";

const TITLE = "We craft digital products that hold up.";

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
              Building premium interfaces for the modern web. From e-commerce to highly complex web applications. Dark-first. Refined. Purpose-built.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 group relative overflow-hidden font-mono text-xs md:text-sm uppercase tracking-widest font-bold">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Link href="/contact" className="flex items-center gap-2">
                  START A PROJECT <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" className="w-full sm:w-auto font-mono text-xs md:text-sm uppercase tracking-widest">
                <Link href="/work">VIEW SELECTED WORK</Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}
