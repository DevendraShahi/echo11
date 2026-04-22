"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Network, Globe } from "lucide-react";

// --- Mini Visual Components for the Engine ---

const ArchitectureVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center p-4">
    <motion.div 
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 100 }}
      className="w-16 h-16 md:w-20 md:h-20 rounded-none bg-black border border-white/10 flex items-center justify-center z-20 shadow-[0_0_40px_var(--accent-glow)]"
    >
      <Network className="w-8 h-8 text-accent" />
    </motion.div>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-full h-full border-[0.5px] border-white/5 rounded-full"
        initial={{ rotate: 0 }} animate={{ rotate: 360 }}
        transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
        style={{ width: `${140 + i * 80}px`, height: `${140 + i * 80}px` }}
      >
        <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_var(--accent-glow)] transform -translate-x-1/2" />
      </motion.div>
    ))}
  </div>
);

const DesignVisual = () => (
  <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 p-6 scale-90 md:scale-100">
    <motion.div 
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
      className="w-full max-w-[280px] h-12 bg-white/5 rounded-none border border-white/10 flex items-center px-4"
    >
      <div className="w-6 h-6 bg-white/10 mr-3 rounded-none" />
      <div className="w-24 h-2 bg-white/10 rounded-none" />
    </motion.div>
    <div className="flex w-full max-w-[280px] gap-4 h-36">
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="w-1/3 h-full bg-accent/5 rounded-none border border-accent/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent" />
      </motion.div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="w-2/3 h-full bg-white/5 rounded-none border border-white/10 flex flex-col gap-3 p-4 justify-center"
      >
        <div className="w-full h-2 bg-white/10 rounded-none" />
        <div className="w-5/6 h-2 bg-white/10 rounded-none" />
        <div className="w-1/2 h-2 bg-white/10 rounded-none" />
        <div className="mt-2 w-1/3 h-6 bg-accent/20 border border-accent/30 rounded-none" />
      </motion.div>
    </div>
  </div>
);

const EngineeringVisual = () => {
  const code = [
    '<Container>',
    '  <motion.div',
    '    initial={{ opacity: 0 }}',
    '    animate={{ opacity: 1 }}',
    '    className="premium"',
    '  >',
    '    <CoreSystem />',
    '  </motion.div>',
    '</Container>'
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] md:max-w-[320px] bg-[#030303] rounded-none border border-white/10 overflow-hidden shadow-2xl scale-90 md:scale-100">
        <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/5 bg-white/5">
          <div className="w-2.5 h-2.5 rounded-none bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-none bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-none bg-green-500/50" />
        </div>
        <div className="p-4 font-mono text-[12px] md:text-[13px] leading-[1.8] text-accent/80">
          {code.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="whitespace-pre">
              <span className="text-white/20 mr-4 select-none">{i + 1}</span>
              {line}
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, repeat: Infinity, duration: 1 }} className="mt-1 text-white">_</motion.div>
        </div>
      </div>
    </div>
  );
};

const DeploymentVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    <Globe className="w-12 h-12 text-white/20 absolute z-10" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50" />
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute border border-accent/30 rounded-full"
        initial={{ scale: 0.2, opacity: 1 }} animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
        style={{ width: '100px', height: '100px' }}
      />
    ))}
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-56 h-56">
      <div className="absolute top-0 left-1/2 w-2 h-2 bg-accent shadow-[0_0_15px_var(--accent-glow)] rounded-none" />
      <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-white shadow-[0_0_10px_white] rounded-none" />
      <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-accent shadow-[0_0_15px_var(--accent-glow)] rounded-none" />
    </motion.div>
    <div className="absolute bottom-4 left-4 right-4 flex justify-between z-20 bg-black/50 p-3 rounded-none border border-white/5 backdrop-blur-sm">
      <div className="flex flex-col">
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Network Status</span>
        <span className="font-mono text-[11px] md:text-xs text-accent">200 OK — Ready</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Global Latency</span>
        <span className="font-mono text-[11px] md:text-xs text-accent">12ms (Edge)</span>
      </div>
    </div>
  </div>
);

export const steps = [
  { 
    num: "01", 
    title: "Discovery & Architecture", 
    desc: "We align on outcomes, user intent, and product constraints, then translate that into a clear technical blueprint before development starts.",
    specs: ["Product Scope", "System Blueprint", "Data Model"],
    visual: ArchitectureVisual
  },
  { 
    num: "02", 
    title: "Design & Interaction", 
    desc: "We shape interface direction, interaction patterns, and component language so the product feels precise, branded, and easy to use.",
    specs: ["Interface Direction", "Component System", "Motion Rules"],
    visual: DesignVisual
  },
  { 
    num: "03", 
    title: "Product Engineering", 
    desc: "We build clean, testable systems with dependable release practices, balancing delivery speed with long-term maintainability.",
    specs: ["Typed Codebase", "Reliable Delivery", "Quality Gates"],
    visual: EngineeringVisual
  },
  { 
    num: "04", 
    title: "Launch & Scale", 
    desc: "We launch with confidence, monitor performance continuously, and iterate based on real user behavior and business feedback.",
    specs: ["Production Rollout", "Observability", "Iteration Loop"],
    visual: DeploymentVisual
  },
];

function StepContent({ step, isActive, onActive }: { step: typeof steps[0], isActive: boolean, onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Creates a highly accurate trigger zone right in the center of the user's viewport
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px", once: false });

  useEffect(() => {
    if (isInView) {
      onActive();
    }
  }, [isInView, onActive]);

  const Visual = step.visual;

  return (
    <div ref={ref} className={`flex flex-col pb-24 pt-12 md:pb-40 md:pt-20 transition-all duration-1000 ease-[0.16,1,0.3,1] ${isActive ? 'opacity-100' : 'opacity-[0.15] blur-[2px] md:hover:opacity-40 md:hover:blur-none'}`}>
       <div className="font-mono text-accent text-2xl md:text-3xl mb-6 tracking-widest border-b border-white/10 pb-4 w-fit inline-block">
         {step.num}
       </div>
       <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans text-white mb-6 tracking-tight leading-[1.1]">
         {step.title}
       </h3>
       <p className="font-mono text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
         {step.desc}
       </p>
       <div className="flex flex-wrap gap-3 pt-4">
         {step.specs.map((spec: string, j: number) => (
           <span key={j} className="font-mono text-[11px] md:text-xs text-accent uppercase tracking-widest border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-none">
             [{spec}]
           </span>
         ))}
       </div>

       {/* Mobile Visual Integration: Embedded right below the text since there is no right-column */}
       <div className="lg:hidden w-full aspect-square rounded-none flex items-center justify-center overflow-hidden relative mt-4">
           {/* Deep subtle glow for blending */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-accent/5 blur-[50px] rounded-full pointer-events-none opacity-50" />
           
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Visual />
           </div>
       </div>
    </div>
  );
}

export function ProcessTimeline({ standalone = false }: { standalone?: boolean } = {}) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className={`relative overflow-clip ${standalone ? 'py-16' : 'py-12 md:py-32 bg-black border-y border-white/5'}`}>
      <Container>
        {/* Simplified Header Segment */}
        <div className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-sans text-foreground mb-6 tracking-tight">
              The <span className="text-accent text-glow">Engine.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono leading-relaxed">
              A structured delivery system that keeps strategy, design, and engineering aligned from kickoff to scale.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-none mb-4 md:mb-0">
            <span className="w-2 h-2 rounded-none bg-accent animate-pulse shadow-[0_0_10px_var(--accent-glow)]" />
            <span className="font-mono text-[10px] md:text-xs tracking-widest text-white uppercase mt-0.5">Delivery System Active</span>
          </div>
        </div>

        {/* Uncompressed Side-by-Side Sticky Flow */}
        <div className="flex flex-col lg:flex-row relative items-start gap-0 lg:gap-16 xl:gap-24">
          
          {/* Left Text Scroll Column */}
          <div className="w-full lg:w-[45%] flex flex-col relative z-10 pt-[5vh] lg:pt-[15vh] pb-[20vh]">
            {steps.map((step, index) => (
              <StepContent 
                key={index} 
                step={step} 
                isActive={activeStep === index} 
                onActive={() => setActiveStep(index)} 
              />
            ))}
          </div>

          {/* Right Sticky Canvas (Hardware Accelerated & Dedicated) */}
          <div className="hidden lg:flex lg:w-[55%] sticky top-[15vh] h-[70vh] min-h-[500px] rounded-none items-center justify-center overflow-hidden">
             {/* Deep lighting beacon replacing hard container bounds */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-accent/[0.03] via-black/0 to-transparent pointer-events-none transition-all duration-1000" />
             
             {/* Abstract background indexing number - Extremely faint integration */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-sans font-black text-white/[0.015] tracking-tighter select-none z-0 pointer-events-none leading-none">
               {steps[activeStep].num}
             </div>

             <AnimatePresence mode="wait">
               <motion.div
                 key={activeStep}
                 initial={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
                 animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 0.98, filter: "blur(5px)" }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="w-full h-full flex items-center justify-center p-8 absolute inset-0 z-10 pointer-events-none"
               >
                 {(() => {
                   const Visual = steps[activeStep].visual;
                   return <Visual />;
                 })()}
               </motion.div>
             </AnimatePresence>
          </div>

        </div>
      </Container>
    </section>
  );
}
