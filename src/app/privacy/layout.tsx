import { createMetadata } from "@/lib/seo";

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
  return <>{children}</>;
}
