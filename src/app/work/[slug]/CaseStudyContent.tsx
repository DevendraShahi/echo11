"use client";

import { useRef, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Check, ArrowUpRight, Layers, Zap, Target, Eye, MousePointer } from "lucide-react";
import { CaseStudy } from "@/data/caseStudies";

interface CaseStudyContentProps {
  project: CaseStudy;
  prevProject: CaseStudy;
  nextProject: CaseStudy;
}

function FloatingParticle({ delay = 0, x = 0, y = 0 }: { delay?: number; x?: number; y?: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-accent/40 rounded-full"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [-20, 20, -20],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function AnimatedMetric({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center group cursor-default"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 100, delay: delay + 0.2 }}
        className="text-4xl md:text-5xl font-bold font-sans mb-2 transition-colors"
        style={{ color: "var(--project-color, #7877c6)" }}
      >
        {value}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.4 }}
        className="font-mono text-xs text-white/40 uppercase tracking-wider"
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

export function CaseStudyContent({ project, prevProject, nextProject }: CaseStudyContentProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <PageWrapper>
      <div 
        ref={heroRef}
        className="pt-48 pb-16 relative overflow-hidden"
        style={{ "--project-color": project.color } as React.CSSProperties}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle_at_30%_20%, ${project.color}15, transparent_50%)` }} />
        
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <FloatingParticle 
              key={i} 
              delay={i * 0.3}
              x={10 + Math.random() * 80}
              y={10 + Math.random() * 80}
            />
          ))}
        </div>
        
        <motion.div style={{ y: heroY }} className="relative z-10">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link 
                href="/work" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-white font-mono text-sm mb-8 transition-colors group"
              >
                <motion.span
                  animate={{ x: [0, -4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.span>
                All Projects
              </Link>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 mb-6"
              >
                <span className="font-mono text-sm text-accent px-3 py-1 border border-accent/30 bg-accent/10 rounded-sm">{project.category}</span>
                <span className="text-white/20">•</span>
                <span className="font-mono text-sm text-white/40">{project.year}</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-6 leading-[1.1]"
              >
                {project.title}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-muted-foreground font-mono leading-relaxed mb-10 max-w-2xl"
              >
                {project.tagline}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                {project.link && (
                  <Button asChild className="font-mono group relative overflow-hidden">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      Visit Site <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="font-mono">
                  <Link href="/contact">Start Similar Project</Link>
                </Button>
              </motion.div>
            </motion.div>
          </Container>
        </motion.div>
      </div>

      <motion.div
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="pointer-events-none"
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative aspect-video w-full overflow-hidden rounded-none border border-white/10 bg-[#050505]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${project.thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
            
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              {project.link ? (
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/60 hover:bg-white/10 transition-all group"
                >
                  <ExternalLink className="w-10 h-10 text-white/60 group-hover:text-white group-hover:scale-110 transition-all" />
                </a>
              ) : (
                <span className="font-sans font-black text-white/10 text-[12rem] leading-none select-none">WIP</span>
              )}
            </motion.div>
            
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        </Container>
      </motion.div>

      <div className="py-16 border-y border-white/5 relative overflow-hidden" style={{ "--project-color": project.color } as React.CSSProperties}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${project.color}40, transparent)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <Container className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {project.results.map((result, index) => (
              <AnimatedMetric key={result.metric} value={result.value} label={result.metric} delay={index * 0.1} />
            ))}
          </div>
        </Container>
      </div>

      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
        
        <Container className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-4"
            >
              <div className="sticky top-32 space-y-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 border border-white/10 bg-white/[0.02] rounded-none"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5 text-accent" />
                    <h3 className="font-mono text-xs text-accent uppercase tracking-widest">Services</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.services.map((service, index) => (
                      <motion.span 
                        key={service}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="px-3 py-1.5 text-xs font-mono text-white/60 border border-white/10 bg-white/[0.02] rounded-sm hover:border-accent/30 hover:text-accent transition-colors cursor-default"
                      >
                        {service}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-6 border border-white/10 bg-white/[0.02] rounded-none"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Layers className="w-5 h-5 text-accent" />
                    <h3 className="font-mono text-xs text-accent uppercase tracking-widest">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <motion.span 
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="px-3 py-1.5 text-xs font-mono text-white/60 border border-white/10 bg-white/[0.02] rounded-sm hover:border-accent/30 hover:text-accent transition-colors cursor-default"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="p-6 border border-white/10 bg-white/[0.02] rounded-none"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-accent" />
                    <h3 className="font-mono text-xs text-accent uppercase tracking-widest">Features</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {project.features.map((feature, index) => (
                      <motion.div 
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.05 }}
                        className="flex items-center gap-3 text-sm font-mono text-white/60 group"
                      >
                        <Check className="w-4 h-4 transition-colors" style={{ color: project.color }} />
                        <span className="group-hover:text-white transition-colors">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-8"
            >
              <div className="flex flex-col gap-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                      className="w-14 h-14 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center"
                    >
                      <Eye className="w-7 h-7 text-accent" />
                    </motion.div>
                    <div>
                      <span className="font-mono text-xs text-white/30 uppercase tracking-widest">Overview</span>
                      <h2 className="text-2xl font-bold font-sans text-white">Project Summary</h2>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground font-mono leading-loose pl-[4.5rem]">
                    {project.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <span className="font-mono text-2xl font-bold text-accent">01</span>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-white/30 uppercase tracking-widest">Phase One</span>
                      <h2 className="text-2xl font-bold font-sans text-white">The Challenge</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 pl-[4.5rem]">
                    {project.challenges.map((challenge, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        className="flex items-start gap-4 p-6 border border-white/10 bg-white/[0.02] rounded-none transition-colors cursor-default"
                        style={{
                          borderColor: hoveredIndex === index ? `${project.color}50` : undefined,
                          background: hoveredIndex === index ? `${project.color}08` : undefined,
                        }}
                      >
                        <MousePointer className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: project.color }} />
                        <p className="text-muted-foreground font-mono text-sm leading-relaxed">{challenge}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <span className="font-mono text-2xl font-bold text-accent">02</span>
                    </div>
                    <div>
                      <span className="font-mono text-xs text-white/30 uppercase tracking-widest">Phase Two</span>
                      <h2 className="text-2xl font-bold font-sans text-white">Our Solution</h2>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 pl-[4.5rem]">
                    {project.solutions.map((solution, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="flex items-start gap-4 p-6 border border-white/10 bg-white/[0.02] rounded-none hover:border-accent/30 transition-colors cursor-default"
                      >
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: project.color }} />
                        <p className="text-muted-foreground font-mono text-sm leading-relaxed">{solution}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      <div className="py-16 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent" />
        
        <Container className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href={`/work/${prevProject.id}`} 
              className="group block"
            >
              <motion.div 
                whileHover={{ x: -5 }}
                className="flex items-center gap-6 p-8 border border-white/10 hover:border-accent/30 transition-all"
              >
                <div className="w-16 h-16 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center group-hover:border-accent/30 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-white/40 group-hover:text-accent transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="font-mono text-xs text-white/40 block mb-1">Previous Project</span>
                  <span className="font-sans font-bold text-xl text-white group-hover:text-accent transition-colors">{prevProject.title}</span>
                </div>
                <ArrowUpRight className="w-6 h-6 text-white/20 group-hover:text-accent transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
              </motion.div>
            </Link>

            <Link 
              href={`/work/${nextProject.id}`} 
              className="group block"
            >
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-6 p-8 border border-white/10 hover:border-accent/30 transition-all md:text-right"
              >
                <ArrowUpRight className="w-6 h-6 text-white/20 group-hover:text-accent transition-all group-hover:-translate-x-1 group-hover:-translate-y-1" />
                <div className="flex-1">
                  <span className="font-mono text-xs text-white/40 block mb-1">Next Project</span>
                  <span className="font-sans font-bold text-xl text-white group-hover:text-accent transition-colors">{nextProject.title}</span>
                </div>
                <div className="w-16 h-16 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center group-hover:border-accent/30 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white/40 group-hover:text-accent transition-colors" />
                </div>
              </motion.div>
            </Link>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
