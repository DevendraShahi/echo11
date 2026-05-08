import { createMetadata } from "@/lib/seo";

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
  return <>{children}</>;
}
