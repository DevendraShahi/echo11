import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LegalPage } from "@/components/sections/legal-page";
import { LEGAL_TERMS, LEGAL_UPDATED_AT } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service | Echo11",
  description: "Terms governing Echo11 service engagements and delivery policies.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Echo11 Terms of Service",
        }}
      />
      <LegalPage
        title="Terms of Service"
        intro="These terms define how Echo11 engages with clients for strategy, design, engineering, and maintenance work."
        updatedAt={LEGAL_UPDATED_AT}
        sections={LEGAL_TERMS}
      />
    </>
  );
}
