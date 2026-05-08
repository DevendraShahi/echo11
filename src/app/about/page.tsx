import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { SkillsTerminal } from "@/components/sections/SkillsTerminal";
import { PhilosophyGrid } from "@/components/sections/PhilosophyGrid";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About | echo11",
  description: "Meet the product engineering studio behind echo11's strategy-first, quality-driven digital delivery.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Introduction Hero Area */}
      <div className="pt-48 pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
             <div className="lg:col-span-7">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-8 leading-[1.1]">
                  We build products that <span className="text-accent text-glow">earn trust.</span>
                </h1>
                <p className="text-xl text-muted-foreground font-mono leading-relaxed mb-12">
                  echo11 is a Nepal-based product engineering studio partnering with founders and teams worldwide. We combine clear product strategy, premium interface design, and robust engineering so your product launches strong and scales without chaos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="font-mono bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <Link href="/contact">Book Discovery</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="font-mono border-white/20 text-white">
                    <Link href="/work">See Our Work</Link>
                  </Button>
                </div>
             </div>

             <div className="lg:col-span-5 hidden lg:flex justify-end relative">
                <div className="w-[300px] h-[300px] border border-white/10 bg-[#030303] rounded-none shadow-[inset_0_0_50px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_50%)] opacity-10 blur-[30px]" />
                   <div className="grain-overlay opacity-20 mix-blend-overlay absolute inset-0 pointer-events-none" />
                   
                   {/* Massive pure typography graphic */}
                   <div className="font-sans font-black text-white/[0.04] text-[180px] leading-none select-none">
                     11
                   </div>
                </div>
             </div>
          </div>
        </Container>
      </div>

      {/* The ./skills.sh Terminal Interface */}
      <SkillsTerminal />

      {/* The Core Capabilities Architecture Grid */}
      <PhilosophyGrid />

    </PageWrapper>
  );
}
