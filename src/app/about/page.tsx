import { PageWrapper } from "@/components/layout/PageWrapper";
import { createMetadata } from "@/lib/seo";
import { navigation } from "@/data/navigation";
import { AboutExperience } from "./AboutExperience";

export const metadata = createMetadata({
  title: `${navigation.about.name} | echo11`,
  description: "Meet Echo11, a website studio connecting strategy, design, and engineering. Explore our perspective, connected disciplines, and the standards behind our work.",
  path: "/about",
});

export default function AboutPage() {
  return <PageWrapper><AboutExperience /></PageWrapper>;
}
