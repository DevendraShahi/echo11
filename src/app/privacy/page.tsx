"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from "lucide-react";

const sections = [
  { id: "collection", title: "1. Information We Collect" },
  { id: "usage", title: "2. How We Use Your Information" },
  { id: "sharing", title: "3. Information Sharing" },
  { id: "security", title: "4. Data Security" },
  { id: "cookies", title: "5. Cookies" },
  { id: "rights", title: "6. Your Rights" },
  { id: "third-party", title: "7. Third-Party Links" },
  { id: "changes", title: "8. Changes to This Policy" },
  { id: "contact", title: "9. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <div className="pt-48 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.08),transparent_50%)]" />
        
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
              Privacy Policy
            </h1>
            
            <p className="text-muted-foreground font-mono text-sm mb-2">Last updated: March 2026</p>
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
                  <Shield className="w-8 h-8 text-accent" />
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
                <section id="collection" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">1. Information We Collect</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose space-y-4 pl-[3.5rem]">
                    <p>We collect information you provide directly to us, such as when you:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Fill out a contact form on our website</li>
                      <li>Subscribe to our newsletter</li>
                      <li>Communicate with us via email or social media</li>
                      <li>Request a project consultation</li>
                    </ul>
                    <p>This information may include your name, email address, phone number, company name, project details, and any other information you choose to provide.</p>
                  </div>
                </section>

                <section id="usage" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Eye className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">2. How We Use Your Information</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose space-y-4 pl-[3.5rem]">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Respond to your inquiries and provide customer support</li>
                      <li>Deliver the services you have requested</li>
                      <li>Send you updates about our services (with your consent)</li>
                      <li>Improve our website and services</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </section>

                <section id="sharing" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Lock className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">3. Information Sharing</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Service providers who assist us in operating our website</li>
                      <li>Professional advisors such as lawyers and accountants</li>
                      <li>Authorities when required by law</li>
                    </ul>
                  </div>
                </section>

                <section id="security" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">4. Data Security</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
                  </div>
                </section>

                <section id="cookies" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">5. Cookies</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Our website may use cookies to enhance your browsing experience. Cookies are small files stored on your device. You can choose to disable cookies through your browser settings, but this may affect website functionality.</p>
                  </div>
                </section>

                <section id="rights" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">6. Your Rights</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Depending on your location, you may have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate information</li>
                      <li>Request deletion of your information</li>
                      <li>Object to processing of your information</li>
                      <li>Data portability</li>
                    </ul>
                    <p className="mt-4">To exercise these rights, please contact us at hello@echo11.dev.</p>
                  </div>
                </section>

                <section id="third-party" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">7. Third-Party Links</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.</p>
                  </div>
                </section>

                <section id="changes" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">8. Changes to This Policy</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.</p>
                  </div>
                </section>

                <section id="contact" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-none border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold font-sans text-white">9. Contact Us</h2>
                  </div>
                  <div className="text-muted-foreground font-mono text-sm leading-loose pl-[3.5rem]">
                    <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
