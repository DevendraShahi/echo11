"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { MonitorSmartphone, Code2, Gauge, Wrench } from "lucide-react";

export const services = [
  {
    id: "web",
    title: "Website Design & Build",
    description: "High-performance, accessible, and stunning websites that convert.",
    icon: <MonitorSmartphone className="w-8 h-8 text-accent" />,
    features: ["Custom UI/UX", "Next.js / React", "CMS Integration", "Animations"],
  },
  {
    id: "app",
    title: "App Development",
    description: "Native and cross-platform apps for web and mobile platforms.",
    icon: <Code2 className="w-8 h-8 text-accent" />,
    features: ["React Native", "PWA Architecture", "State Management", "API Design"],
  },
  {
    id: "perf",
    title: "Performance & SEO",
    description: "Deep technical audits to rank higher and load faster.",
    icon: <Gauge className="w-8 h-8 text-accent" />,
    features: ["Lighthouse 95+", "Core Web Vitals", "Technical SEO", "Image Optimization"],
  },
  {
    id: "maintain",
    title: "Maintenance Retainer",
    description: "Ongoing support to keep your digital products running smoothly.",
    icon: <Wrench className="w-8 h-8 text-accent" />,
    features: ["Security Updates", "Bug Fixes", "Feature Additions", "24/7 Monitoring"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function ServicesGrid({ standalone = false }: { standalone?: boolean } = {}) {
  return (
    <section className={`relative ${standalone ? 'py-16' : 'py-32 bg-black border-t border-white/5'}`}>
      <Container>
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold font-sans text-foreground mb-6 tracking-tight">
              Our Core <span className="text-accent text-glow">Expertise.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono leading-relaxed">
              We provide end-to-end digital engineering. Focused entirely on technical architecture, performance metrics, and premium aesthetic execution.
            </p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]"
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id} 
              variants={itemVariants}
              className={`group ${index === 0 || index === 3 ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <Card className={`h-full flex flex-col relative overflow-hidden transition-all duration-700 rounded-none p-8 group-hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] ${standalone ? 'bg-transparent border-none shadow-none group-hover:shadow-none p-0 md:p-4' : 'bg-black border border-white/10 hover:border-white/30'}`}>
                {/* Visual Background Elements */}
                <div className="absolute inset-x-0 -top-px h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-black to-black opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Abstract subtle inner glow based on index */}
                <div className={`absolute w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none transition-all duration-1000
                  ${index % 2 === 0 ? '-top-48 -left-48 group-hover:translate-x-12 group-hover:translate-y-12' : '-bottom-48 -right-48 group-hover:-translate-x-12 group-hover:-translate-y-12 group-hover:bg-accent/10'}`} 
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-12">
                    <div className="p-3 bg-white/5 rounded-none border border-white/5 text-white/60 group-hover:text-accent group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-700">
                      {service.icon}
                    </div>
                    <span className="font-mono text-xs tracking-wider text-white/20 font-bold group-hover:text-accent/50 transition-colors duration-500">0{index + 1}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold font-sans tracking-tight mb-4 text-white/80 group-hover:text-white transition-colors duration-500">
                    {service.title}
                  </h3>
                  
                  <p className="font-mono text-white/40 text-[14px] leading-loose mb-12 max-w-sm group-hover:text-white/60 transition-colors duration-500">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="w-full h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center font-mono text-[13px] text-white/50 group-hover:text-white/80 transition-colors duration-500">
                          <span className="w-[4px] h-[4px] rounded-none bg-white/20 group-hover:bg-accent mr-3 transition-colors duration-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
