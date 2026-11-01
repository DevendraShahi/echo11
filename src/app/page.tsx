import { MotionConfig } from "framer-motion";
import { Hero } from "@/components/sections/Hero";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Statement } from "@/components/sections/Statement";
import { Capabilities } from "@/components/sections/Capabilities";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { MakeItYours } from "@/components/sections/MakeItYours";
import { CTABanner } from "@/components/sections/CTABanner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata = createMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {

  return (
    <PageWrapper>
      <MotionConfig reducedMotion="user">
        <main>
          <Hero />
          <div className="home-content relative z-10 -mt-[60svh] bg-background">
            <ClientLogos />
            <Statement />
            <Capabilities />
            <FeaturedWork />
            <MakeItYours />
            <ProcessTimeline />
            <CTABanner />
          </div>
        </main>
      </MotionConfig>
    </PageWrapper>
  );
}
