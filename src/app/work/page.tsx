import { PageWrapper } from "@/components/layout/PageWrapper";
import { SelectedWork } from "@/components/sections/SelectedWork";

export const metadata = {
  title: "Work | echo11",
  description: "Case studies from shipped products across commerce, SaaS, content, and creative platforms.",
};

export default function WorkPage() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-16 min-h-screen">
        <SelectedWork standalone={true} />
      </div>
    </PageWrapper>
  );
}
