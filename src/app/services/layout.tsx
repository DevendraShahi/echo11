import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Services | echo11",
  description:
    "Business websites, redesigns, and online stores built around your customers. Echo11 is a website studio.",
  path: "/services",
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
