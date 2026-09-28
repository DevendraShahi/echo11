import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Process | echo11",
  description: "How echo11 scopes, designs, builds, and scales digital products — from discovery through launch with clear milestones and dependable delivery.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <PageWrapper>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Process", item: absoluteUrl("/process") },
      ])]} />
      <div className="pt-32 pb-16 min-h-screen">
        <ProcessTimeline standalone={true} />
      </div>
    </PageWrapper>
  );
}
