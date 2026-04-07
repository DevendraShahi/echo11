"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight, Github, Twitter, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Footer() {
  const [time, setTime] = useState<string>("00:00:00");
  const pathname = usePathname();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (pathname.startsWith('/lab') || pathname.startsWith('/portal')) {
    return null;
  }

  return (
    <footer className="w-full bg-black relative border-t border-white/5 overflow-hidden pt-32 pb-8">
      {/* Background ambient noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-accent/[0.05] via-black to-black opacity-100 pointer-events-none" />

      <Container className="relative z-10">

        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 border-b border-white/10 pb-20">

          {/* Logo & Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit transition-opacity hover:opacity-80">
              <div className="relative w-32 h-10">
                <Image
                  src="/echo11-logo-white.svg"
                  alt="echo11 logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-white/40 max-w-sm text-sm font-mono leading-relaxed">
              A premium technical studio based in Nepal. We engineer highly scalable architectures and design uncompromised digital products.
            </p>

            {/* Real-time Status */}
            <div className="mt-4 flex items-center gap-4 border border-white/10 w-fit px-4 py-2 rounded-full bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="font-mono text-xs uppercase tracking-widest text-white/50">Systems Online</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="font-mono text-xs text-white/50 tracking-widest">
                KTM {time}
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-12 font-mono">
            {/* Execution */}
            <div className="flex flex-col gap-6">
              <h4 className="font-bold text-white/80 font-sans uppercase tracking-[0.2em] text-[11px]">Execution</h4>
              <nav className="flex flex-col gap-4 text-[13px]">
                <Link href="/services" className="text-white/40 hover:text-white transition-colors">Architecture</Link>
                <Link href="/services" className="text-white/40 hover:text-white transition-colors">Product Design</Link>
                <Link href="/services" className="text-white/40 hover:text-white transition-colors">Core Engineering</Link>
                <Link href="/services" className="text-white/40 hover:text-white transition-colors">Infrastructure</Link>
              </nav>
            </div>

            {/* Studio */}
            <div className="flex flex-col gap-6">
              <h4 className="font-bold text-white/80 font-sans uppercase tracking-[0.2em] text-[11px]">Studio</h4>
              <nav className="flex flex-col gap-4 text-[13px]">
                <Link href="/work" className="text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
                  Archive <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </Link>
                <Link href="/methodology" className="text-white/40 hover:text-white transition-colors">Methodology</Link>
                <Link href="/manifesto" className="text-white/40 hover:text-white transition-colors">Manifesto</Link>
              </nav>
            </div>

            {/* Network */}
            <div className="flex flex-col gap-6 col-span-2 lg:col-span-1">
              <h4 className="font-bold text-white/80 font-sans uppercase tracking-[0.2em] text-[11px]">Network</h4>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-accent hover:border-accent/40 bg-white/[0.02] hover:bg-accent/10 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-accent hover:border-accent/40 bg-white/[0.02] hover:bg-accent/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-accent hover:border-accent/40 bg-white/[0.02] hover:bg-accent/10 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
              <a href="mailto:hello@echo11.dev" className="mt-4 text-[13px] text-white/50 hover:text-white transition-colors flex items-center gap-2 group">
                hello@echo11.dev
                <ArrowUpRight className="w-3 h-3 group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>
          </div>

        </div>

        {/* Huge Bottom Typography */}
        <div className="w-full flex justify-center mt-20 mb-10 overflow-hidden relative group cursor-default">
          {/* Base subtle text */}
          <h1 className="text-[18vw] font-bold font-sans leading-[0.8] tracking-tighter text-white/[0.02] select-none text-center transition-all duration-1000 ease-out group-hover:text-white/[0.04]">
            echo11.
          </h1>

          {/* Layered glowing text that unveils softly */}
          <h1 className="text-[18vw] font-bold font-sans leading-[0.8] tracking-tighter select-none text-center absolute top-0 left-1/2 -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out pointer-events-none drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            echo11.
          </h1>

          {/* Ambient bottom floor light */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-1000 ease-out pointer-events-none blur-sm shadow-[0_0_30px_var(--accent-glow)]" />
        </div>

        {/* Bottom Legal Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono tracking-widest text-white/30 uppercase mt-4">
          <p>© {new Date().getFullYear()} echo11 Dev Studio. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </Container>
    </footer>
  );
}
