import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { PortalFeatures } from '@/components/blocks/portal-features'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Container } from '@/components/ui/Container'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'Client Portal — echo11',
  description:
    'The Echo11 client portal gives you full visibility into your project — milestones, invoices, contracts, and direct team communication in one place.',
  path: '/client',
})

const accessPoints = [
  'Real-time project milestone tracking',
  'Invoice history and PDF downloads',
  'Contract review and status',
  'Direct messaging with the Echo11 team',
  'Instant notifications on project updates',
  'Secure, access-controlled workspace',
]

export default function ClientPortalPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden bg-black pt-40 pb-24 md:pt-48 md:pb-32">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[700px] -translate-x-1/2 bg-[#00E5FF]/[0.05] blur-[140px]" />

        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-[#00E5FF]">
              Echo11 — Client Portal
            </p>
            <h1 className="mb-6 font-sans text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
              Your project,{' '}
              <span className="text-[#00E5FF]">always visible.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl font-mono text-sm leading-relaxed text-white/50">
              The Echo11 client portal is a private workspace where you can follow your
              project from first milestone to final handover — without chasing the team
              for updates.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/portal"
                className="group relative flex items-center gap-2 overflow-hidden border border-[#00E5FF] bg-[#00E5FF]/10 px-8 py-3 font-mono text-sm font-semibold text-[#00E5FF] transition-all duration-300 hover:bg-[#00E5FF]/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Access Your Portal
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                href="/contact"
                className="font-mono text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
              >
                Talk through a project →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Access checklist strip */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10">
        <Container>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accessPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 font-mono text-sm text-white/60"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#00E5FF]" />
                {point}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Features block */}
      <PortalFeatures />

      {/* Final CTA */}
      <section className="border-t border-white/10 bg-black py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#00E5FF]">
              Already a client?
            </p>
            <h2 className="mb-6 font-sans text-3xl font-bold tracking-tight text-white md:text-4xl">
              Your workspace is ready.
            </h2>
            <p className="mb-10 font-mono text-sm leading-relaxed text-white/50">
              Log in with your credentials to access your project dashboard, invoice
              history, contracts, and direct team messages.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/portal"
                className="group flex items-center gap-2 border border-[#00E5FF] bg-[#00E5FF]/10 px-8 py-3 font-mono text-sm font-semibold text-[#00E5FF] transition-all duration-300 hover:bg-[#00E5FF]/20"
              >
                Go to Portal
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="font-mono text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
              >
                Not a client yet? Start a conversation →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </PageWrapper>
  )
}
