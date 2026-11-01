import { PageWrapper } from "@/components/layout/PageWrapper";
import { createMetadata } from "@/lib/seo";
import { navigation } from "@/data/navigation";
import { ProcessExperience } from "./ProcessExperience";

export const metadata = createMetadata({
  title: `${navigation.process.name} | echo11`,
  description: "A clear way from ambition to launch. Explore Echo11’s website process, your deliverables, shared decisions, typical timelines, and ownership at handover.",
  path: "/process",
});

export default function ProcessPage() {
  return <PageWrapper><ProcessExperience /></PageWrapper>;
}
