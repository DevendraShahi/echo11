import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CTABanner } from "@/components/sections/CTABanner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata = createMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

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
