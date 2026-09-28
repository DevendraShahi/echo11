"use client";

import { FormEvent, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { submitContactInquiry } from "@/lib/actions/marketing-contact-actions";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const projectTypes = [
  "Website design and build",
  "Product or platform build",
  "Client portal or internal tool",
  "Performance, SEO, or rebuild",
  "Ongoing support"
];

const timelines = ["ASAP", "2-4 weeks", "1-2 months", "3+ months", "Still exploring"];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    projectType: projectTypes[0],
    timeline: timelines[4],
    budget: "",
    message: "",
    website: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await submitContactInquiry({
      name: form.name,
      email: form.email,
      company: form.company,
      projectType: form.projectType,
      timeline: form.timeline,
      budget: form.budget,
      message: form.message,
      website: form.website,
    });

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <PageWrapper>
        <div className="pt-48 pb-16 min-h-screen">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-none border border-accent/30 bg-accent/10 flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-foreground mb-6">
                Inquiry <span className="text-accent">received.</span>
              </h1>
              <p className="font-mono text-muted-foreground mb-8 leading-relaxed">
                Thank you for reaching out. We&apos;ll review your project details and respond with clear next steps within 24 hours.
              </p>
              <Button
                variant="outline"
                className="font-mono"
                onClick={() => {
                  setStatus("idle");
                  setForm({
                    name: "",
                    email: "",
                    company: "",
                    projectType: projectTypes[0],
                    timeline: timelines[4],
                    budget: "",
                    message: "",
                    website: ""
                  });
                }}
              >
                Send Another Inquiry
              </Button>
            </div>
          </Container>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-48 pb-16 min-h-screen">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight text-foreground mb-6 text-glow">
                Let&apos;s scope <br />
                <span className="text-accent text-glow">what matters.</span>
              </h1>
              <p className="font-mono text-muted-foreground mb-12 max-w-md leading-relaxed">
                Tell us what you are trying to build, what is already in place, and where you need help. We will review your inquiry and respond with a clear next step.
              </p>
              <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-8 font-mono text-sm text-white/50 sm:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Best fit</p>
                  <p>Websites, portals, platforms, internal tools, and product rebuilds.</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Response</p>
                  <p>A clear reply after we review scope, timing, and constraints.</p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Location</p>
                  <p>Nepal-based, working with teams remotely.</p>
                </div>
              </div>
            </div>
            <div className="glass p-10 md:p-12 rounded-none border border-white/10 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {/* Subtle inner gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />
              <form className="relative z-10 flex flex-col gap-6" onSubmit={handleSubmit}>
                {/* Honeypot field - hidden from real users */}
                <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-mono text-foreground">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      required
                      className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-mono text-foreground">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      required
                      className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="company" className="text-sm font-mono text-foreground">Company / Organization</label>
                  <input
                    type="text"
                    id="company"
                    value={form.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                    placeholder="Company name"
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="projectType" className="text-sm font-mono text-foreground">Project Type</label>
                    <select
                      id="projectType"
                      value={form.projectType}
                      onChange={(event) => updateField("projectType", event.target.value)}
                      className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                    >
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="timeline" className="text-sm font-mono text-foreground">Timeline</label>
                    <select
                      id="timeline"
                      value={form.timeline}
                      onChange={(event) => updateField("timeline", event.target.value)}
                      className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                    >
                      {timelines.map((timeline) => (
                        <option key={timeline} value={timeline}>{timeline}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="budget" className="text-sm font-mono text-foreground">Budget Range</label>
                  <input
                    type="text"
                    id="budget"
                    value={form.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500"
                    placeholder="Optional, but useful for scoping"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-mono text-foreground">Project Details</label>
                  <textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    required
                    className="bg-white/[0.02] hover:border-white/20 border border-white/10 rounded-none px-5 py-4 text-foreground font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all duration-500 resize-none"
                    placeholder="What are you building, who is it for, what exists today, and what needs to change?"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 border border-red-500/30 bg-red-500/5">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="font-mono text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4 font-mono text-lg font-bold shadow-[0_0_15px_var(--accent-glow)]"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending inquiry...
                    </span>
                  ) : (
                    "Send Project Inquiry"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
