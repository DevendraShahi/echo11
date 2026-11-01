import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About us | echo11",
  description:
    "The product beliefs behind echo11's approach to clarity, useful design, transparent delivery, and durable craft.",
  path: "/about",
});

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
