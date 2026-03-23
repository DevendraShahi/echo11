import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTABanner } from "@/components/sections/CTABanner";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const metadata = {
  title: "echo11 | Premium Web & App Development Studio",
  description: "We craft digital products that hold up.",
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
