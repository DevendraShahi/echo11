"use client";

import { useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Code2, Layers, Zap, Shield, ArrowDown, Check, ChevronRight } from "lucide-react";

const principles = [
  {
    icon: Code2,
    title: "Technical Excellence",
    desc: "We write production-grade code from day one. Clean architecture, comprehensive testing, and maintainable solutions that scale with your business.",
    number: "001"
  },
  {
    icon: Layers,
    title: "Systematic Thinking",
    desc: "Every project starts with understanding the whole system. We design for scalability, performance, and future growth before writing a single line of code.",
    number: "002"
  },
  {
    icon: Zap,
    title: "Rapid Iteration",
    desc: "We ship MVPs fast and iterate based on real data. Continuous deployment, A/B testing, and agile sprints keep your product moving forward.",
    number: "003"
  },
  {
    icon: Shield,
    title: "Security First",
    desc: "Security is not an afterthought. We implement best practices, regular audits, and robust infrastructure to protect your users and data.",
    number: "004"
  }
];

const process = [
  {
    step: "01",
    title: "Discovery",
    desc: "Deep dive into your business goals, user needs, and technical requirements. We ask tough questions to understand the real problems that need solving.",
    details: ["Stakeholder interviews", "User research", "Technical audit", "Competitive analysis"]
  },
  {
    step: "02",
    title: "Architecture",
    desc: "Design the system architecture, choose the right tech stack, and create detailed specifications. We plan for scale from the beginning.",
    details: ["System design", "Tech stack selection", "Database schema", "API design"]
  },
  {
    step: "03",
    title: "Prototype",
    desc: "Rapid prototyping to validate concepts and get early user feedback. We iterate quickly until we get the UX right.",
    details: ["Wireframes", "Interactive prototypes", "User testing", "Design iteration"]
  },
  {
    step: "04",
    title: "Build",
    desc: "Full-scale development with continuous integration, automated testing, and regular demos. You see progress every sprint.",
    details: ["Agile sprints", "CI/CD pipeline", "Automated testing", "Weekly demos"]
  },
  {
    step: "05",
    title: "Launch",
    desc: "Careful deployment, performance optimization, and monitoring setup. We ensure smooth rollouts with zero downtime strategies.",
    details: ["DevOps setup", "Performance tuning", "Monitoring & alerts", "Launch strategy"]
  },
  {
    step: "06",
    title: "Evolve",
    desc: "Ongoing maintenance, performance monitoring, and feature iterations. We treat your product as a living system that constantly improves.",
    details: ["24/7 monitoring", "Regular updates", "Feature additions", "Performance reports"]
  }
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "99%", label: "Client Satisfaction" },
  { value: "3x", label: "Faster Than Average" },
  { value: "24/7", label: "Support Available" }
];

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-4xl md:text-5xl font-bold font-sans text-accent mb-2"
      >
        {value}
      </motion.div>
      <div className="font-mono text-xs text-white/40 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export default function MethodologyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <PageWrapper>
      <div ref={containerRef} className="pt-48 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-accent/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div 
                className="w-8 h-[1px] bg-accent"
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
              <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">Our Methodology</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-8 leading-[1.1]"
            >
              How we <span className="text-accent text-glow">build.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground font-mono leading-relaxed mb-12 max-w-2xl"
            >
              A systematic methodology forged from years of building production systems. We combine engineering rigor with creative problem-solving to deliver exceptional results.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden md:flex items-center gap-2 text-white/30"
          >
            <span className="font-mono text-sm">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </Container>
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="py-20 relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {principles.map((principle, index) => (
              <motion.div 
                key={principle.title} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 border border-white/10 bg-black/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-accent to-transparent group-hover:w-full transition-all duration-700" />
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <span className="font-mono text-xs text-white/20 mb-6 block">{principle.number}</span>
                
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-500"
                >
                  <principle.icon className="w-7 h-7 text-white/60 group-hover:text-accent transition-colors" />
                </motion.div>
                
                <h3 className="text-lg font-bold font-sans text-white mb-3 group-hover:text-accent transition-colors">{principle.title}</h3>
                <p className="text-sm text-muted-foreground font-mono leading-relaxed">{principle.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </motion.div>

      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
        
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20 text-center"
          >
            <motion.div 
              className="inline-flex items-center gap-3 mb-6 px-4 py-2 border border-white/10 bg-white/[0.02] rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-xs text-white/60">Our Proven Process</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-foreground mb-6">
              Six phases of <span className="text-accent text-glow">excellence.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
              Each phase builds on the last. We don&apos;t skip steps, but we stay flexible to your timeline.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[3.75rem] md:left-[6rem] top-0 bottom-0 w-[1px] hidden md:block">
              <motion.div 
                className="w-full bg-gradient-to-b from-accent via-accent/50 to-transparent"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />
            </div>
            
            <div className="flex flex-col gap-0">
              {process.map((item, index) => (
                <motion.div 
                  key={item.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group grid grid-cols-[3rem_1fr] md:grid-cols-[6rem_1fr] gap-6 md:gap-12 py-12 border-b border-white/5 last:border-b-0"
                >
                  <div className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-none border border-white/10 bg-black flex items-center justify-center group-hover:border-accent group-hover:bg-accent/10 transition-all duration-500 relative z-10"
                    >
                      <span className="font-mono text-sm text-accent font-bold">{item.step}</span>
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pt-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold font-sans text-white group-hover:text-accent transition-colors duration-500">{item.title}</h3>
                        <ChevronRight className="w-5 h-5 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-muted-foreground font-mono leading-relaxed max-w-xl mb-6">{item.desc}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.details.map((detail, i) => (
                          <motion.span 
                            key={detail}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-white/50 border border-white/5 bg-white/[0.02] rounded-sm"
                          >
                            <Check className="w-3 h-3 text-accent" />
                            {detail}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <div className="py-24 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/[0.08] via-transparent to-transparent" />
        
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        </div>
        
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-4">Our Track Record</h2>
            <p className="text-muted-foreground font-mono">Numbers that speak for themselves</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <AnimatedCounter key={stat.label} {...stat} />
            ))}
          </div>
        </Container>
      </div>

      <div className="py-20 relative">
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold font-sans text-white mb-2">Ready to start?</h3>
                <p className="text-muted-foreground font-mono">Book a discovery call to discuss your project.</p>
              </div>
              
              <Button size="lg" className="font-mono group relative overflow-hidden min-w-[200px]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Link href="/contact" className="flex items-center justify-center gap-2 relative z-10">
                  Start a Project <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>
    </PageWrapper>
  );
}
