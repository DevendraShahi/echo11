"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const projects = [
  { id: "trueluxe", title: "TrueLuxe Nepal", category: "E-Commerce", desc: "Skincare ecommerce with advanced filtering.", link: "https://trueluxe-nepal.vercel.app" },
  { id: "prika", title: "Prika Couture", category: "Fashion", desc: "Lifestyle and fashion brand digital storefront.", link: "https://prika.vercel.app" },
  { id: "leaders", title: "The Leaders NP", category: "Corporate", desc: "Corporate platform for the-leadersnp.com.", link: "https://the-leadersnp.com" },
  { id: "green", title: "Green Lifestyle", category: "Blog", desc: "Sustainability blog with optimized reading experience.", link: "https://devendrashahi.pythonanywhere.com/" },
  { id: "studentstack", title: "StudentStack", category: "SaaS", desc: "EdTech SaaS platform for students.", link: "https://studentstack.vercel.app" },
  { id: "3am3d", title: "3am3d", category: "Creative", desc: "3D and creative studio portfolio.", link: "https://3am3d.vercel.app" },
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
              A curated index of highly engineered digital interfaces.
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

                <div className="py-8 md:py-12 px-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 cursor-pointer">
                  {/* Title & Index */}
                  <div className="flex items-center gap-6 md:gap-12 w-full md:w-1/2">
                    <span className={`font-mono text-sm transition-colors duration-500 ${isActive ? 'text-accent' : 'text-white/20'}`}>
                      0{index + 1}
                    </span>
                    <h3 className={`text-3xl md:text-5xl font-sans font-bold tracking-tight transition-all duration-500 origin-left 
                      ${isActive ? 'text-white translate-x-4' : 'text-white/40 group-hover:text-white/70'}`}
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
                          
                          {project.link ? (
                            <div 
                              className="absolute top-0 left-0 w-[400%] md:w-[250%] lg:w-[200%] h-[400%] md:h-[250%] lg:h-[200%] origin-top-left scale-[0.25] md:scale-[0.4] lg:scale-[0.5] opacity-40 group-hover/img:opacity-100 transition-all duration-1000 ease-out z-10 grayscale group-hover/img:grayscale-0 blur-[2px] group-hover/img:blur-0 pointer-events-none group-hover/img:pointer-events-auto overflow-hidden rounded-none"
                            >
                              <iframe 
                                src={project.link} 
                                className="w-full h-full border-none bg-black"
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                                tabIndex={-1}
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center z-10 opacity-5 group-hover/img:opacity-20 transition-opacity duration-700">
                               <span className="font-sans font-black text-white text-[15rem] leading-none tracking-tighter">0{index + 1}</span>
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
