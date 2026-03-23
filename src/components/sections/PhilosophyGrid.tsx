"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Zap, Code, Layout, Blocks } from "lucide-react";

const features = [
  {
    title: "Performance First",
    desc: "From millisecond interactions to flawless 100 Lighthouse scores, we engineer specifically to eliminate layout shift and latency.",
    icon: Zap,
    delay: 0,
  },
  {
    title: "Typed Strictness",
    desc: "Our codebases rely on rigorous TypeScript constraints, avoiding runtime errors and ensuring completely stable edge deployments.",
    icon: Code,
    delay: 0.1,
  },
  {
    title: "Fluid Geometry",
    desc: "Motion matters. We leverage physics-based spring dampening for every UI transition, ensuring the interaction feels fundamentally human.",
    icon: Layout,
    delay: 0.2,
  },
  {
    title: "Component Ecosystems",
    desc: "We don't build pages. We build robust, scaleable design systems that our partners can extend and deploy across infinite contexts.",
    icon: Blocks,
    delay: 0.3,
  },
];

export function PhilosophyGrid() {
  return (
    <section className="py-24 relative overflow-hidden bg-black border-y border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      <Container>
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-sans text-white mb-4 tracking-tight">
            Our Architecture.
          </h2>
          <p className="font-mono text-white/50 max-w-xl">
            Uncompromising technical standards. Here is what we optimize for when we build your digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                className="group p-8 border border-white/5 bg-[#030303] hover:border-accent/40 hover:bg-white/[0.02] transition-colors rounded-none shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-none flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/10 transition-transform duration-500">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-sans tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm font-mono text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
