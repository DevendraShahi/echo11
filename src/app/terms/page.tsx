"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Container } from "@/components/ui/Container";
import { TermsContent } from "./TermsContent";

export default function TermsPage() {
  return (
    <PageWrapper>
      <main id="top" tabIndex={-1}>
      <div className="studio-intro pb-16 relative overflow-hidden">
        
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
            
            <p className="text-muted-foreground font-mono text-sm mb-2">Last updated: October 11, 2026</p>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl leading-relaxed">
              These terms describe the legal framework for working with echo11, including scope, payment, responsibilities, and delivery expectations.
            </p>
          </motion.div>
        </Container>
      </div>

        <TermsContent />
      </main>
    </PageWrapper>
  );
}
