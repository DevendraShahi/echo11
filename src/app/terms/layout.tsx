import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms of Service | echo11",
  description:
    "Read echo11's terms of service for project scope, payment terms, responsibilities, confidentiality, and delivery expectations.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
