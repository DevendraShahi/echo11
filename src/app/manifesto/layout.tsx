import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Manifesto | echo11",
  description:
    "The principles behind echo11's approach to product clarity, useful design, transparent delivery, and engineering craft that earns trust.",
  path: "/manifesto",
});

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Manifesto", item: absoluteUrl("/manifesto") },
      ])]} />
      {children}
    </>
  );
}
