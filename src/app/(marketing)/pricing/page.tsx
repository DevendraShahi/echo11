import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { PricingCalculator } from "@/components/sections/pricing-calculator";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing | Echo11",
  description:
    "Transparent delivery plans for teams that need predictable website growth operations.",
  pathname: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="container-shell page-section">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Echo11 Pricing",
        }}
      />

      <header className="section-heading">
        <p className="section-marker">Pricing</p>
        <h1>Transparent operating plans with SLA-backed delivery.</h1>
        <p>
          Pricing is structured around execution velocity and operational depth,
          not arbitrary package volume.
        </p>
      </header>

      <PricingCalculator />
    </div>
  );
}
