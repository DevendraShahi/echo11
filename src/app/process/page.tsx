import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";


export const metadata = {
  title: "Process | echo11",
  description: "The delivery engine behind how echo11 scopes, designs, builds, and scales digital products.",
};

export default function ProcessPage() {
  return (
    <PageWrapper>
      <div className="pt-32 pb-16 min-h-screen">
        <ProcessTimeline standalone={true} />
      </div>
    </PageWrapper>
  );
}
