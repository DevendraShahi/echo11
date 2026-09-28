import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { SkillsTerminal } from "@/components/sections/SkillsTerminal";
import { PhilosophyGrid } from "@/components/sections/PhilosophyGrid";
import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "About | echo11",
  description: "Meet Echo11, a Nepal-based product engineering studio helping teams design and build reliable websites, platforms, and digital tools.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageWrapper>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "About", item: absoluteUrl("/about") },
      ])]} />
      {/* Introduction Hero Area */}
      <div className="pt-48 pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
             <div className="lg:col-span-7">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-sans tracking-tight text-foreground mb-8 leading-[1.1]">
                  A focused product team for <span className="text-accent text-glow">serious digital work.</span>
                </h1>
                <p className="text-xl text-muted-foreground font-mono leading-relaxed mb-12">
                  Echo11 is a Nepal-based product engineering studio. We help founders and companies turn complex requirements into clear, stable, well-designed software without hiding the tradeoffs along the way.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="font-mono bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <Link href="/contact">Talk Through a Project</Link>
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
