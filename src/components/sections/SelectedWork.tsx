"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const projects = [
  { id: "trueluxe", title: "TrueLuxe Nepal", category: "E-Commerce", desc: "Skincare commerce rebuilt around guided discovery, faster checkout, and stronger mobile conversion.", link: "https://trueluxe-nepal.vercel.app", heroImage: "/work/TrueLuxe-Nepal-Premium-Beauty-Skincare-TrueLuxe-Nepal-hero.webp" },
  { id: "prika", title: "Prika Couture", category: "Fashion", desc: "A luxury storefront blending editorial brand storytelling with strict performance budgets.", link: "https://prika.vercel.app", heroImage: "/work/Prika-Luxury-Bridal-Evening-Couture-hero.webp" },
  { id: "leaders", title: "The Leaders NP", category: "Civic Media", desc: "A Nepal-focused history, political, and social publishing platform with idea-led articles and structured data.", link: "https://the-leadersnp.com", heroImage: "/work/The-Leaders-LeadersNP-hero.webp" },
  { id: "green", title: "Green Lifestyle", category: "Sustainability", desc: "A community platform where users share, read, and discuss daily sustainable practices for a greener environment.", link: "https://devendrashahi.pythonanywhere.com/", heroImage: null },
  { id: "studentstack", title: "StudentStack", category: "Student Deals", desc: "A student benefits platform for finding verified deals, offers, and subscriptions with clear claim steps.", link: "https://studentstack.vercel.app", heroImage: "/work/StudentStack-hero.webp" },
  { id: "3am3d", title: "3am3d", category: "Creative", desc: "A WebGL studio platform balancing immersive portfolio experiences with clear booking conversion.", link: "https://3am3d.vercel.app", heroImage: "/work/3AM3D-Premium-Digital-Assets-hero.webp" },
];



export function SelectedWork({ standalone = false }: { standalone?: boolean } = {}) {
  const [activeProject, setActiveProject] = useState<string | null>(projects[0].id);

  return (
    <section className={`py-32 relative overflow-hidden ${standalone ? '' : 'bg-black border-y border-white/5'}`}>
      {/* Decorative glows */}
      {!standalone && <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 blur-[200px] rounded-none pointer-events-none opacity-50" />}
      
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-7xl font-bold font-sans text-foreground mb-6 tracking-tight">
              Selected <span className="text-accent text-glow">Works.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-mono leading-relaxed max-w-xl">
              Six case studies showing how brand clarity and engineering rigor translated into measurable business results.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex font-mono h-12 px-6 rounded-none border-white/10 hover:border-white/30 hover:bg-white/5">
            <Link href="/work" className="flex items-center gap-2">
              View Complete Archive <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Project Vertical Index */}
        <div className="flex flex-col border-t border-white/10 relative z-10 w-full mb-12">
          {projects.map((project, index) => {
            const isActive = activeProject === project.id;

            return (
              <div 
                key={project.id}
                className="group border-b border-white/5 relative"
                onMouseEnter={() => setActiveProject(project.id)}
              >
                {/* Background hover light */}
                <div className={`absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${isActive ? 'opacity-100' : ''}`} />

                <div className="relative z-10 flex cursor-pointer flex-col items-start justify-between gap-6 px-2 py-8 md:flex-row md:items-center md:py-12">
                  {/* Title & Index */}
                  <div className="flex w-full min-w-0 items-center gap-6 md:w-1/2 md:gap-12">
                    <span className={`font-mono text-sm transition-colors duration-500 ${isActive ? 'text-accent' : 'text-white/20'}`}>
                      0{index + 1}
                    </span>
                    <h3 className={`min-w-0 pr-2 text-3xl font-sans font-bold tracking-tight transition-all duration-500 origin-left md:text-5xl 
                      ${isActive ? 'text-white md:translate-x-4' : 'text-white/40 group-hover:text-white/70'}`}
                    >
                      {project.title}
                    </h3>
                  </div>

                  {/* Desktop Category / Info */}
                  <div className="hidden md:flex flex-row items-center gap-8 w-1/4 justify-start">
                    <span className="font-mono text-xs uppercase tracking-widest text-white/30 truncate">
                      {project.category}
                    </span>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="hidden md:flex items-center justify-end w-1/4 pr-4 relative z-20">
                    {project.link ? (
                      <Link 
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-none border flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-black group/arrow
                          ${isActive ? 'border-accent/40 bg-accent/10 shadow-[0_0_20px_var(--accent-glow)]' : 'border-white/10 group-hover:border-accent/30'}`}
                      >
                        <ArrowRight className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-accent -rotate-45 group-hover/arrow:rotate-[-45deg]' : 'text-white/30 group-hover:text-accent group-hover/arrow:rotate-[-45deg]'}`} />
                      </Link>
                    ) : (
                      <div className={`w-12 h-12 rounded-none border flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-black group/arrow
                        ${isActive ? 'border-accent/40 bg-accent/10 shadow-[0_0_20px_var(--accent-glow)]' : 'border-white/10 group-hover:border-white/30'}`}
                      >
                        <ArrowRight className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-accent -rotate-45' : 'text-white/30 group-hover:text-white/60 -rotate-0'}`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Highly elegant accordion image reveal for desktop/mobile */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row gap-8 pb-12 px-2 pt-2 md:pt-6">
                        {/* Live Site Preview Box */}
                        <div className="w-full md:w-[60%] aspect-video bg-[#050505] rounded-none border border-white/5 relative overflow-hidden group/img">
                          {/* Protect from clicks and apply aesthetic overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 pointer-events-none transition-opacity duration-700 group-hover/img:opacity-60" />
                          <div className="grain-overlay mix-blend-overlay absolute inset-0 opacity-[0.25] z-20 pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700 blur z-20 pointer-events-none" />
                          
                          {project.heroImage ? (
                            <Image
                              src={project.heroImage}
                              alt={`${project.title} hero preview`}
                              fill
                              sizes="(min-width: 768px) 60vw, 100vw"
                              className="object-cover object-top z-10 opacity-60 group-hover/img:opacity-100 transition-all duration-700 grayscale group-hover/img:grayscale-0 scale-100 group-hover/img:scale-[1.02]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center z-10 opacity-5 group-hover/img:opacity-20 transition-opacity duration-700">
                              <div className="text-center">
                                <span className="font-sans font-black text-white text-[10rem] md:text-[15rem] leading-none tracking-tighter block">0{index + 1}</span>
                                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Hero Preview Pending</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="w-full md:w-[40%] flex flex-col justify-end pb-4 pt-4 md:pt-0">
                          <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] font-mono text-white/50 bg-white/5 rounded-none mb-6 w-fit">
                            {project.category}
                          </span>
                          <p className="text-white/60 font-mono text-sm leading-relaxed mb-8 max-w-sm">
                            {project.desc}
                          </p>
                          <Link 
                            href={`/work/${project.id}`} 
                            className="text-accent font-mono text-sm uppercase tracking-widest hover:text-white transition-colors duration-300 flex items-center gap-2 group/link"
                          >
                            View Case Study <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform duration-300" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 flex justify-center md:hidden">
          <Button asChild variant="outline" className="font-mono w-full rounded-none h-14 border-white/10 hover:bg-white/5 hover:border-white/20">
            <Link href="/work">View Complete Archive</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
