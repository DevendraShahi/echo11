import { createMetadata, faqJsonLd, serviceJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Services | echo11",
  description:
    "Website design, app development, performance SEO, and maintenance retainers for teams that need reliable digital product delivery.",
  path: "/services",
});

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most engagements run 4-12 weeks depending on scope and dependencies. We set timeline ranges and milestones during discovery.",
  },
  {
    q: "What's included in the pricing?",
    a: "Scope typically includes planning, design, development, QA, launch support, and handover documentation.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes. Our retainers cover monitoring, fixes, iterative improvements, and structured release support.",
  },
  {
    q: "Can you work with existing codebases?",
    a: "Yes. We audit existing systems, stabilize risky areas, and then improve incrementally without disrupting operations.",
  },
];

const services = [
  {
    name: "Website Design & Build",
    description: "Conversion-focused websites built for speed, trust, and long-term growth.",
    url: absoluteUrl("/services#web"),
  },
  {
    name: "App Development",
    description: "Web and mobile products engineered for reliability, adoption, and scale.",
    url: absoluteUrl("/services#app"),
  },
  {
    name: "Performance & SEO",
    description: "Technical optimization that improves discoverability, speed, and retention.",
    url: absoluteUrl("/services#perf"),
  },
  {
    name: "Maintenance Retainer",
    description: "Continuous support to keep releases stable, secure, and momentum high.",
    url: absoluteUrl("/services#maintain"),
  },
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[faqJsonLd(faqs), serviceJsonLd(services)]} />
      {children}
    </>
  );
}
