import { createMetadata } from "@/lib/seo";

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
  return <>{children}</>;
}
