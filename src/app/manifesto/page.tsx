"use client";

import { useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Target, Heart, Eye, Sparkles, Quote, ArrowUpRight } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Precision Over Speed",
    quote: "Fast and wrong is worse than slow and right.",
    desc: "We would rather deliver one exceptional feature than five mediocre ones. Every pixel, every line of code, every interaction is intentional."
  },
  {
    icon: Heart,
    title: "User-Centric Design",
    quote: "Technology exists to serve people, not the other way around.",
    desc: "We start every project by understanding who will use it and why. Beautiful design means nothing if it does not solve real problems for real people."
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    quote: "No hidden fees, no surprises, no vague timelines.",
    desc: "You will always know exactly where your project stands. We communicate clearly, honestly, and frequently—good news and bad."
  },
  {
    icon: Sparkles,
    title: "Craftsmanship Matters",
    quote: "Good enough is not good enough.",
    desc: "We care deeply about the details that others overlook. The code others call over-engineered, we call well-engineered. Your users feel the difference."
  }
];

const beliefs = [
  { text: "The best interface is no interface—solve problems before they reach the screen." },
  { text: "Performance is a feature. Every 100ms matters." },
  { text: "Accessibility is not an add-on; it is a design requirement." },
  { text: "Technical debt is real debt. We do not compound interest." },
  { text: "The simplest solution is usually the right one—until it is not." },
  { text: "Launching imperfect work is better than perfecting work that never launches." },
  { text: "Documentation is love. Future-you will thank present-you." },
  { text: "The best tools are the ones your team will actually use." }
];

export default function ManifestoPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <PageWrapper>
      <div ref={heroRef} className="pt-48 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.12),transparent_50%)]"
            style={{ y: heroY }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10"
        >
          <Container>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl"
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
                <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">Our Manifesto</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-8 leading-[1.1]">
                Our <span className="text-accent text-glow">Manifesto.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground font-mono leading-relaxed mb-12 max-w-2xl">
                This is what we believe. These principles guide every decision we make, every line of code we write, and every product we ship.
              </p>
            </motion.div>
          </Container>
        </motion.div>
      </div>

      <div className="py-20 relative">
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-12 h-12 rounded-none bg-accent/10 border border-accent/20 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-accent" />
              </motion.div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-2">
                  The Four Pillars
                </h2>
                <p className="text-muted-foreground font-mono">What we stand for.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div 
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
                className="group relative p-8 md:p-10 border border-white/10 bg-black/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-500 overflow-hidden"
              >
                <motion.div 
                  className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{ scale: [1, 1.1, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <motion.div 
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-500"
                    >
                      <pillar.icon className="w-8 h-8 text-white/60 group-hover:text-accent transition-colors" />
                    </motion.div>
                    <span className="font-mono text-xs text-white/20">0{index + 1}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold font-sans text-white mb-6 group-hover:text-accent transition-colors duration-500">{pillar.title}</h3>
                  
                  <div className="relative mb-6 pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent via-accent/50 to-transparent" />
                    <Quote className="absolute -left-1 -top-2 w-4 h-4 text-accent/50" />
                    <p className="font-mono text-sm text-accent italic leading-relaxed pl-4">{pillar.quote}</p>
                  </div>
                  
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      <div className="py-24 relative border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <Container className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-foreground mb-4">
              Small truths that shape <span className="text-accent text-glow">big decisions.</span>
            </h2>
            <p className="text-muted-foreground font-mono">The principles that drive every line of code.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-5xl mx-auto"
          >
            {beliefs.map((belief, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start gap-5 py-6 border-b border-white/5"
              >
                <motion.div 
                  className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center flex-shrink-0 group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
                </motion.div>
                <p className="text-white/70 font-mono text-sm leading-relaxed group-hover:text-white transition-colors pt-2">{belief.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </div>

      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>
        
        <Container className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="w-24 h-24 rounded-full border-2 border-accent/30 bg-accent/5 flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-12 h-12 text-accent" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-6">
              Live these values?
            </h2>
            
            <p className="text-lg text-muted-foreground font-mono mb-10">
              Let&apos;s build something exceptional together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="font-mono group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Link href="/contact" className="flex items-center gap-2 relative z-10">
                    Get in Touch <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" variant="outline" className="font-mono group">
                  <Link href="/work" className="flex items-center gap-2">
                    View Our Work <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </div>

      <div className="py-16 border-t border-white/5 relative overflow-hidden">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
          >
            <div>
              <h3 className="text-lg font-bold font-sans text-white mb-2">Want to learn more?</h3>
              <p className="text-muted-foreground font-mono text-sm">Explore our methodology and see how we work.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/methodology" className="group flex items-center gap-2 text-sm font-mono text-accent hover:text-white transition-colors">
                Our Process <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>
    </PageWrapper>
  );
}
