import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";


export const metadata = {
  title: "Process | echo11",
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
