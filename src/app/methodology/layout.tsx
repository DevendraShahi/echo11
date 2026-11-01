import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "How we work | echo11",
  description:
    "The engineering principles and delivery method echo11 uses to reduce product risk, ship useful systems, and keep momentum after launch.",
  path: "/process",
});

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
