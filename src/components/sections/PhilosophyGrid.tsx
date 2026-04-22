"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Zap, Code, Layout, Blocks } from "lucide-react";

const features = [
  {
    title: "Performance First",
    desc: "We design for perceived and real speed, reducing latency and interaction friction where it actually impacts users.",
    icon: Zap,
    delay: 0,
  },
  {
    title: "Typed Strictness",
    desc: "Strict typing and clear contracts keep delivery predictable, reduce regressions, and protect long-term maintainability.",
    icon: Code,
    delay: 0.1,
  },
  {
    title: "Intentional Interaction",
    desc: "Motion and transitions are applied with purpose so products feel coherent, branded, and easy to navigate.",
    icon: Layout,
    delay: 0.2,
  },
  {
    title: "Component Ecosystems",
    desc: "We build extensible systems, not one-off screens, so your product can evolve without constant rewrites.",
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
            The standards we enforce on every engagement to keep product quality high and delivery reliable.
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
