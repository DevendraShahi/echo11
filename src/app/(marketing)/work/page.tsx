import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { WorkGrid } from "@/components/sections/work-grid";
import { PROJECTS } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Work | Echo11",
  description:
    "Case studies and project systems from Echo11 across finance, healthcare, and SaaS operations.",
  pathname: "/work",
});

export default function WorkPage() {
  return (
    <div className="container-shell page-section">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Echo11 Work",
          description: "Case studies and project outcomes.",
        }}
      />

      <header className="section-heading">
        <p className="section-marker">Work</p>
        <h1>Portfolio systems built for business outcomes, not gallery aesthetics.</h1>
        <p>
          Every project includes strategy context, technology rationale, and
          measurable results.
        </p>
      </header>

      <WorkGrid projects={PROJECTS} />
    </div>
  );
}
