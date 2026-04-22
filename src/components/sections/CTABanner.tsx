"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-32 md:py-48 relative overflow-hidden bg-black border-t border-white/5">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,_var(--tw-gradient-stops))] from-accent/10 via-black to-black opacity-80" />
      
      {/* Animated Grid Floor */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,black,transparent)]" />

      <Container className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl relative"
        >
          {/* Glowing Border Box */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 rounded-none blur-xl opacity-50" />
          
          <div className="bg-[#050505] p-12 md:p-24 rounded-none border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Inner Light Sweep */}
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 w-1/2 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" 
            />

            <div className="w-16 h-16 rounded-none bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] relative group cursor-crosshair">
              <div className="absolute inset-0 bg-accent/20 rounded-none blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <Terminal className="w-8 h-8 text-accent relative z-10" />
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-7xl font-bold font-sans tracking-tight text-white mb-8">
              Build Your Next <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent/80 to-accent">Growth Product.</span>
            </h2>

            <p className="max-w-2xl text-white/50 font-mono text-sm md:text-lg mb-12 leading-relaxed">
              Start with a focused discovery session. We align product goals, technical direction, and delivery plan before we write the first line of code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-20">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-none bg-white text-black hover:bg-white/90 font-mono text-sm uppercase tracking-widest font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
                <Link href="/contact" className="flex items-center justify-center gap-3">
                  Book Discovery <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-none bg-transparent border-white/10 hover:bg-white/5 hover:border-white/30 text-white font-mono text-sm uppercase tracking-widest transition-all">
                <Link href="mailto:hello@echo11.dev">
                  Email Team
                </Link>
              </Button>
            </div>

          </div>
        </motion.div>
      </Container>
    </section>
  );
}
