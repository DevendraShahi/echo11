import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Contact | echo11",
  description:
    "Contact echo11 to scope a digital product, website, or app with clear strategy, realistic delivery, and strong engineering execution.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Contact", item: absoluteUrl("/contact") },
      ])]} />
      {children}
    </>
  );
}
