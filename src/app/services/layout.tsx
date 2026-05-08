import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services | echo11",
  description:
    "Website design, app development, performance SEO, and maintenance retainers for teams that need reliable digital product delivery.",
  path: "/services",
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
