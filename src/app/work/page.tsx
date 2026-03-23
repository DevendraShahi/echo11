import { PageWrapper } from "@/components/layout/PageWrapper";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "Work | echo11",
  description: "A selection of our best work.",
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
