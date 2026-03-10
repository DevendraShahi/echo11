import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LegalPage } from "@/components/sections/legal-page";
import { LEGAL_ACCESSIBILITY, LEGAL_UPDATED_AT } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement | Echo11",
  description:
    "Accessibility standards and support policy for Echo11 web experiences.",
  pathname: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Echo11 Accessibility Statement",
        }}
      />
      <LegalPage
        title="Accessibility Statement"
        intro="Echo11 is committed to building interfaces that remain usable across assistive technologies and input methods."
        updatedAt={LEGAL_UPDATED_AT}
        sections={LEGAL_ACCESSIBILITY}
      />
    </>
  );
}
