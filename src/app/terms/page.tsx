"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, Mail, CreditCard, Scale } from "lucide-react";

const sections = [
  { id: "agreement", title: "1. Agreement" },
  { id: "services", title: "2. Services" },
  { id: "responsibilities", title: "3. Client Responsibilities" },
  { id: "ip", title: "4. Intellectual Property" },
  { id: "payment", title: "5. Payment Terms" },
  { id: "revisions", title: "6. Revisions and Changes" },
  { id: "timeline", title: "7. Timeline and Delays" },
  { id: "warranties", title: "8. Warranties and Disclaimers" },
  { id: "liability", title: "9. Limitation of Liability" },
  { id: "confidentiality", title: "10. Confidentiality" },
  { id: "termination", title: "11. Termination" },
  { id: "governing", title: "12. Governing Law" },
  { id: "contact", title: "13. Contact" },
];

export default function TermsPage() {
  return (
    <PageWrapper>
      <div className="pt-48 pb-16 relative overflow-hidden">
        
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-white font-mono text-sm mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-accent" />
              <span className="font-mono text-xs text-accent uppercase tracking-[0.3em]">Legal</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold font-sans tracking-tight text-foreground mb-6">
              Terms of Service
            </h1>
            
            <p className="text-muted-foreground font-mono text-sm mb-2">Last updated: April 2026</p>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl leading-relaxed">
              These terms describe the legal framework for working with echo11, including scope, payment, responsibilities, and delivery expectations.
            </p>
          </motion.div>
        </Container>
      </div>

      <div className="pb-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="sticky top-32">
                <div className="w-16 h-16 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6">
                  <Scale className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-mono text-xs text-white/40 uppercase tracking-widest mb-6">Contents</h3>
                <nav className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <a 
                      key={section.id}
                      href={`#${section.id}`}
                      className="font-mono text-sm text-white/40 hover:text-accent transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl"
            >
              <div className="flex flex-col gap-16">
                <section id="agreement" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">1. Agreement</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>By accessing or using echo11&apos;s website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                  </div>
                </section>

                <section id="services" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">2. Services</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>echo11 provides web development, app development, and related digital services. The specific scope, deliverables, timelines, and pricing for any project will be outlined in a separate Statement of Work (SOW) or project agreement.</p>
                  </div>
                </section>

                <section id="responsibilities" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">3. Client Responsibilities</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>You agree to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Provide timely feedback and approvals</li>
                      <li>Supply required content, materials, and access credentials</li>
                      <li>Ensure you have the rights to use any content provided</li>
                      <li>Pay invoices according to the agreed payment schedule</li>
                      <li>Designate a primary contact for project communication</li>
                    </ul>
                  </div>
                </section>

                <section id="ip" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">4. Intellectual Property</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Upon full payment, you will own the final deliverables created specifically for your project. We retain ownership of:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Pre-existing tools, frameworks, and libraries</li>
                      <li>General concepts, techniques, and know-how</li>
                      <li>Draft materials and work-in-progress</li>
                    </ul>
                    <p className="mt-4">We reserve the right to display completed work in our portfolio unless otherwise agreed in writing.</p>
                  </div>
                </section>

                <section id="payment" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">5. Payment Terms</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <ul className="list-disc list-inside space-y-2">
                      <li>A 50% deposit is required before work begins</li>
                      <li>Remaining payment is due upon project completion</li>
                      <li>Invoices are due within 14 days of issuance</li>
                      <li>Late payments may incur a 1.5% monthly interest charge</li>
                    </ul>
                  </div>
                </section>

                <section id="revisions" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">6. Revisions and Changes</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Each project includes a defined number of revision rounds as specified in the SOW. Additional revisions beyond the agreed scope will be billed at our standard hourly rate.</p>
                  </div>
                </section>

                <section id="timeline" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">7. Timeline and Delays</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Project timelines are estimates based on timely client feedback and cooperation. We are not liable for delays caused by:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Delayed feedback or approvals</li>
                      <li>Unforeseen technical complications</li>
                      <li>Third-party service providers</li>
                      <li>Force majeure events</li>
                    </ul>
                  </div>
                </section>

                <section id="warranties" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Scale className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">8. Warranties and Disclaimers</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>We warrant that our services will be performed with reasonable skill and care. We do not warrant specific results, conversion rates, or business outcomes. All implied warranties are disclaimed to the fullest extent permitted by law.</p>
                  </div>
                </section>

                <section id="liability" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Scale className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">9. Limitation of Liability</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Our total liability for any claim arising from our services shall not exceed the amount paid by you for the specific service giving rise to the claim. We shall not be liable for indirect, incidental, consequential, or punitive damages.</p>
                  </div>
                </section>

                <section id="confidentiality" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">10. Confidentiality</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Both parties agree to keep confidential any proprietary or sensitive information shared during the project. This obligation survives the termination of our agreement.</p>
                  </div>
                </section>

                <section id="termination" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">11. Termination</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Either party may terminate this agreement with 14 days written notice. Upon termination:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>All work in progress will be delivered upon payment</li>
                      <li>You will pay for all work completed up to the termination date</li>
                      <li>Both parties will return or destroy confidential materials</li>
                    </ul>
                  </div>
                </section>

                <section id="governing" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Scale className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">12. Governing Law</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>These Terms of Service are governed by the laws of Nepal. Any disputes shall be resolved in the courts of Kathmandu.</p>
                  </div>
                </section>

                <section id="contact" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">13. Contact</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>For questions about these terms, please contact us:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Email: hello@echo11.dev</li>
                      <li>Location: Kathmandu, Nepal</li>
                    </ul>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
