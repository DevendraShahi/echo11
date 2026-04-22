import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTABanner } from "@/components/sections/CTABanner";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const metadata = {
  title: "echo11 | Product Engineering Studio",
  description: "We design and engineer digital products with clear strategy, strong systems, and premium execution.",
};

const industries = [
  "E-Commerce",
  "SaaS Platforms",
  "FinTech",
  "Corporate Portals",
  "Creative Studios",
  "Healthcare Tech"
];

export default function Home() {
  return (
    <PageWrapper>
      <Hero />
      <Marquee items={industries} speed={30} />
      <ServicesGrid />
      <SelectedWork />
      <ProcessTimeline />
      <CTABanner />
    </PageWrapper>
  );
}
