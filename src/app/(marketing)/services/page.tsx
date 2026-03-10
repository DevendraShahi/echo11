import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ServiceTabs } from "@/components/sections/service-tabs";
import { SERVICE_PANELS } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

const SERVICE_TIMELINE = [
  "Discovery and conversion audit",
  "Information architecture and visual system",
  "Production implementation and QA",
  "Launch operations and optimization",
];

export const metadata: Metadata = createPageMetadata({
  title: "Services | Echo11",
  description:
    "Explore Echo11 service systems spanning architecture, performance, storytelling, and retainer operations.",
  pathname: "/services",
});

export default function ServicesPage() {
  return (
    <div className="container-shell page-section">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Echo11 Services",
          itemListElement: SERVICE_PANELS.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.title,
          })),
        }}
      />

      <header className="section-heading">
        <p className="section-marker">Services</p>
        <h1>Service systems designed for measurable business movement.</h1>
        <p>
          Echo11 does not ship isolated pages. We build complete trust and
          conversion architecture with operational accountability.
        </p>
      </header>

      <ServiceTabs />

      <section className="service-timeline" aria-label="Delivery timeline">
        {SERVICE_TIMELINE.map((step, index) => (
          <article key={step}>
            <p>{String(index + 1).padStart(2, "0")}</p>
            <span>{step}</span>
          </article>
        ))}
      </section>

      <section className="service-accordion" aria-label="Service details">
        {SERVICE_PANELS.map((service, index) => (
          <details key={service.slug} open={index === 0}>
            <summary>{service.title}</summary>
            <p>{service.summary}</p>
            <ul>
              {service.process.map((processItem) => (
                <li key={processItem}>{processItem}</li>
              ))}
            </ul>
            <Link href={`/services/${service.slug}`}>Read category page</Link>
          </details>
        ))}
      </section>
    </div>
  );
}
