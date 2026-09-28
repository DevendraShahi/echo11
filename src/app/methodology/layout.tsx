import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Methodology | echo11",
  description:
    "The engineering principles and delivery method echo11 uses to reduce product risk, ship useful systems, and keep momentum after launch.",
  path: "/methodology",
});

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Methodology", item: absoluteUrl("/methodology") },
      ])]} />
      {children}
    </>
  );
}
