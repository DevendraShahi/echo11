import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="pt-48 pb-24 min-h-screen flex items-center">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-mono text-8xl font-bold text-accent/20">404</span>
            <h1 className="text-3xl md:text-5xl font-bold font-sans text-foreground mb-6 -mt-8">
              Project Not Found
            </h1>
            <p className="text-lg text-muted-foreground font-mono leading-relaxed mb-12">
              This case study doesn&apos;t exist or may have been moved. Check out our other work.
            </p>
            <Button asChild variant="outline" className="font-mono">
              <Link href="/work" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                View All Projects
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
