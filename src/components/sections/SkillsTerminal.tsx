"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { X, Minus, Maximize2 } from "lucide-react";

const skillCategories = [
  {
    name: "Product Frontend",
    items: ["React", "Next.js 15", "TypeScript (Strict)", "Framer Motion", "Tailwind CSS"],
  },
  {
    name: "Backend Systems",
    items: ["Node.js", "FastAPI", "PostgreSQL", "Prisma ORM", "Redis"],
  },
  {
    name: "Design Direction",
    items: ["Product UX", "Design Systems", "Interactive Prototyping", "Interface Specs"],
  },
  {
    name: "Cloud & Delivery",
    items: ["Vercel Edge", "AWS", "Docker", "CI/CD Pipelines", "Git"],
  },
];

export function SkillsTerminal() {
  return (
    <section className="py-24 relative">
      <Container>
        <div className="w-full max-w-4xl mx-auto rounded-none border border-white/10 bg-[#050505] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 group/terminal">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)] cursor-pointer transition-colors hover:bg-red-500">
                <X className="w-[8px] h-[8px] text-black opacity-0 group-hover/terminal:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.4)] cursor-pointer transition-colors hover:bg-yellow-500">
                <Minus className="w-[8px] h-[8px] text-black opacity-0 group-hover/terminal:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.4)] cursor-pointer transition-colors hover:bg-green-500">
                <Maximize2 className="w-[6px] h-[6px] text-black opacity-0 group-hover/terminal:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
            </div>
            <div className="font-mono text-xs text-white/40 select-none">echo11 — bash — 80x24</div>
            <div className="w-12" /> {/* Spacer for centering */}
          </div>

          {/* Terminal Body Sequence */}
          <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed text-white/70">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-accent font-bold">~</span>
              <span className="text-white">./skills.sh</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mb-8 text-white/50"
            >
              [System]: Mapping product requirements...
              <br />
              [System]: Loading delivery capabilities...
              <br />
              <span className="text-green-400">[Ready]: Strategy, design, and engineering online.</span>
            </motion.div>

            <div className="flex flex-col gap-6">
              {skillCategories.map((category, idx) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + idx * 0.2 }}
                >
                  <div className="text-accent mb-2 uppercase tracking-widest text-[10px] md:text-xs">
                    {`>> ${category.name}`}
                  </div>
                  <div className="flex flex-wrap gap-2 text-white">
                    {category.items.map((skill, sIdx) => (
                      <span key={skill}>
                        {skill}
                        {sIdx !== category.items.length - 1 && (
                          <span className="text-white/20 mx-2">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.8 }}
              className="mt-8 flex items-center gap-3"
            >
              <span className="text-accent font-bold">~</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2.5 h-5 bg-white block"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
