import { PageWrapper } from "@/components/layout/PageWrapper";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { LiveShowcase } from "@/components/sections/LiveShowcase";
import { WorkCTA } from "@/components/work/WorkCTA";
import { createMetadata } from "@/lib/seo";
import { navigation } from "@/data/navigation";

export const metadata = createMetadata({
  title: `${navigation.work.name} | echo11`,
  description: "Explore Echo11’s business websites, original brand concepts, and publishing platforms. Strategy, design, and engineering brought together.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageWrapper>
      <main className="relative pb-12 md:pb-16 min-h-screen">
        <SelectedWork standalone={true} feature={<LiveShowcase />} />

        {/* Next-step bridge: browsing projects should end in a clear route. */}
        <WorkCTA />
      </main>
    </PageWrapper>
  );
}
