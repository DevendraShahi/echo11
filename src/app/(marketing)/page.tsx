import { ScrollRevealInit } from "@/components/animations/scroll-reveal-init";
import { StatsBand } from "@/components/sections/stats-band";
import { SocialProofMarquee } from "@/components/sections/social-proof-marquee";
import { ServicesShowcase } from "@/components/sections/services-showcase";
import { PlatformGrid } from "@/components/sections/platform-grid";
import { StoriesPreview } from "@/components/sections/stories-preview";
import { WorkPreview } from "@/components/sections/work-preview";
import { TestimonialStrip } from "@/components/sections/testimonial-strip";
import { FinalCta } from "@/components/sections/final-cta";
import { HeroStage } from "@/components/hero-stage";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, createPageMetadata, organizationJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Echo11 | Premium Website Engineering",
  description:
    "Echo11 designs and operates premium web systems with cinematic motion, conversion-first structure, and Core Web Vitals discipline.",
  pathname: "/",
});

export default function MarketingHomePage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Echo11",
          url: SITE_URL,
        }}
      />
      <JsonLd schema={organizationJsonLd()} />

      {/* Hero — untouched as requested */}
      <HeroStage />

      {/* Scroll reveal engine + progress bar */}
      <ScrollRevealInit />

      {/* Countup stats band */}
      <StatsBand />

      {/* Dual-track infinite client marquee */}
      <SocialProofMarquee />

      {/* Numbered service rail with SVG underline draw */}
      <ServicesShowcase />

      {/* Asymmetric bento grid with 3D tilt */}
      <PlatformGrid />

      {/* Story cards with category color chips */}
      <StoriesPreview />

      {/* Work cards with tech stack pills + hover overlay */}
      <WorkPreview />

      {/* Glassmorphism testimonials with avatar initials */}
      <TestimonialStrip />

      {/* Final CTA with beam animation + metric badges */}
      <FinalCta />
    </>
  );
}
