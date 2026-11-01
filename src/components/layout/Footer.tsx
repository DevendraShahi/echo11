"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { footerNavigation, navigation } from "@/data/navigation";
import { siteConfig } from "@/lib/seo";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/lab') || pathname.startsWith('/portal') || pathname.startsWith('/client') || pathname.startsWith('/laltin') || pathname.startsWith('/pizzaslice')) {
    return null;
  }

  return (
    <footer className="w-full bg-black relative border-t border-white/5 overflow-hidden pt-20 md:pt-28 pb-8">
      {/* Background ambient noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-accent/[0.05] via-black to-black opacity-100 pointer-events-none" />

      <Container className="relative z-10">

        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 border-b border-white/10 pb-12 md:pb-20">

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
            <p className="text-white/65 max-w-sm text-sm font-sans leading-7">
              A website studio. We bring strategy, design, and engineering together to make your offer clear and your website easier to use.
            </p>


          </div>

          {/* Names and destinations share the header's navigation source. */}
          <div className="md:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 font-mono">
            {footerNavigation.map(group => (
              <div key={group.title} className="flex flex-col gap-5">
                <h2 className="font-bold text-white/80 font-sans uppercase tracking-[0.2em] text-[11px]">{group.title}</h2>
                <nav aria-label={`Footer ${group.title.toLowerCase()}`} className="flex flex-col gap-1 text-[13px]">
                  {group.links.map(link => (
                    <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-white/65 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{link.name}</Link>
                  ))}
                </nav>
              </div>
            ))}
            <div className="flex flex-col gap-5 col-span-2 lg:col-span-1">
              <h2 className="font-bold text-white/80 font-sans uppercase tracking-[0.2em] text-[11px]">Contact</h2>
              <nav aria-label="Footer contact" className="flex flex-col gap-1 text-[13px]">
                <Link href={navigation.contact.href} className="group inline-flex min-h-11 items-center gap-2 text-white/80 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{navigation.contact.name}<ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" /></Link>
                <a href={`mailto:${siteConfig.email}`} className="group inline-flex min-h-11 items-center gap-2 break-all text-white/65 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{siteConfig.email}<ArrowUpRight aria-hidden="true" className="h-3 w-3 shrink-0" /></a>
              </nav>
            </div>
          </div>

        </div>

        {/* Huge Bottom Typography */}
        <div className="w-full flex justify-center mt-12 md:mt-20 mb-10 overflow-hidden relative group cursor-default">
          {/* Base subtle text */}
          <div className="text-[18vw] font-bold font-sans leading-[0.8] tracking-tighter text-white/[0.02] select-none text-center transition-all duration-1000 ease-out group-hover:text-white/[0.04]">
            echo11.
          </div>

          {/* Layered glowing text that unveils softly */}
          <div className="text-[18vw] font-bold font-sans leading-[0.8] tracking-tighter select-none text-center absolute top-0 left-1/2 -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out pointer-events-none drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            echo11.
          </div>

          {/* Ambient bottom floor light */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-1000 ease-out pointer-events-none blur-sm shadow-[0_0_30px_var(--accent-glow)]" />
        </div>

        {/* Bottom Legal Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono tracking-widest text-white/60 uppercase mt-4">
          <p>© {new Date().getFullYear()} echo11 Dev Studio. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Privacy Policy</Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Terms of Service</Link>
          </div>
        </div>

      </Container>
    </footer>
  );
}
