import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { LegalPage } from "@/components/sections/legal-page";
import { LEGAL_PRIVACY, LEGAL_UPDATED_AT } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy | Echo11",
  description: "Privacy policy covering data handling, retention, and user rights for Echo11.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Echo11 Privacy Policy",
        }}
      />
      <LegalPage
        title="Privacy Policy"
        intro="This page explains what data Echo11 collects, how we use it, and how to exercise your privacy rights."
        updatedAt={LEGAL_UPDATED_AT}
        sections={LEGAL_PRIVACY}
      />
    </>
  );
}
