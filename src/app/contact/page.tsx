"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  return (
    <PageWrapper>
      <div className="pt-48 pb-16 min-h-screen">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight text-foreground mb-6 text-glow">
                Let&apos;s talk about <br />
                <span className="text-accent text-glow">your project.</span>
              </h1>
              <p className="font-mono text-muted-foreground mb-12 max-w-md leading-relaxed">
                Fill out the form to tell us about your requirements, or email us directly at <a href="mailto:hello@echo11.dev" className="text-accent underline">hello@echo11.dev</a>.
              </p>
            </div>
            <div className="glass p-8 rounded-none border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-mono text-foreground">Name</label>
                  <input type="text" id="name" className="bg-black/50 border border-white/10 rounded-none px-4 py-3 text-foreground font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-mono text-foreground">Email</label>
                  <input type="email" id="email" className="bg-black/50 border border-white/10 rounded-none px-4 py-3 text-foreground font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors" placeholder="john@company.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-mono text-foreground">Project Details</label>
                  <textarea id="message" rows={5} className="bg-black/50 border border-white/10 rounded-none px-4 py-3 text-foreground font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none" placeholder="Tell us about the scope, budget, and timeline..."></textarea>
                </div>
                <Button type="submit" size="lg" className="w-full mt-4 font-mono text-lg font-bold shadow-[0_0_15px_var(--accent-glow)]">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
