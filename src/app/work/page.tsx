import { PageWrapper } from "@/components/layout/PageWrapper";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { createMetadata, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = createMetadata({
  title: "Work | echo11",
  description: "See how echo11 plans, designs, and builds websites, platforms, and digital products. Case studies from e-commerce, civic media, and education.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <PageWrapper>
      <JsonLd data={[breadcrumbJsonLd([
        { name: "Home", item: absoluteUrl("/") },
        { name: "Work", item: absoluteUrl("/work") },
      ])]} />
      <div className="pt-32 pb-16 min-h-screen">
        <SelectedWork standalone={true} />
      </div>
    </PageWrapper>
  );
}
