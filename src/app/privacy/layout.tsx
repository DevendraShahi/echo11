import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Privacy Policy | echo11",
  description:
    "Read echo11's privacy policy, including what information is collected, how it is used, and how privacy requests are handled.",
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Privacy Policy", item: absoluteUrl("/privacy") },
      ])]} />
      {children}
    </>
  );
}
