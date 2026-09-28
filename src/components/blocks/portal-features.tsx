import {
  FolderKanban,
  FileText,
  MessageSquare,
  Bell,
  DollarSign,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const portalFeatures = [
  {
    icon: FolderKanban,
    title: 'Project Visibility',
    description:
      'Track milestones, tasks, budget, and delivery timelines in real time — no chasing updates.',
  },
  {
    icon: DollarSign,
    title: 'Invoices & Billing',
    description:
      'View all invoices, payment status, and download PDF copies instantly from one place.',
  },
  {
    icon: FileText,
    title: 'Contracts',
    description:
      'Review, sign, and access all project agreements and contract history in a single dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description:
      'Chat directly with the Echo11 team on your project without switching to email or Slack.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Get notified on milestone completions, invoice updates, and team messages as they happen.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description:
      'Your project data, contracts, and communications are access-controlled and visible only to your team.',
  },
]

export function PortalFeatures() {
  return (
    <section className="bg-black py-20 md:py-32">
      <div className="mx-auto max-w-5xl space-y-16 px-6">
        {/* Header */}
        <div className="relative z-10 grid items-center gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="font-sans text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Everything your project needs.{' '}
            <span className="text-[#00E5FF]">In one place.</span>
          </h2>
          <p className="max-w-sm font-mono text-sm leading-relaxed text-white/50 md:ml-auto">
            The Echo11 client portal gives you full visibility into your project —
            from milestones and invoices to contracts and direct team communication.
          </p>
        </div>

        {/* Dashboard preview image */}
        <div className="relative overflow-hidden border border-white/10 bg-white/5">
          {/* gradient fade at bottom */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent" />
          <Image
            src="/portal-dashboard-preview.png"
            alt="Echo11 client portal dashboard showing project milestones, invoices, and activity feed"
            width={2560}
            height={1440}
            className="relative w-full object-cover object-top"
            priority
          />
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {portalFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-[#00E5FF]" />
                  <h3 className="font-sans text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="font-mono text-sm leading-relaxed text-white/45">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA row */}
        <div className="flex flex-col items-start gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00E5FF]">
              Client portal access
            </p>
            <p className="mt-1 font-sans text-lg font-semibold text-white">
              Your project workspace, always on.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/portal"
              className="group flex items-center gap-2 border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-5 py-2.5 font-mono text-sm text-[#00E5FF] transition-all duration-300 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/70"
            >
              Access Portal
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="font-mono text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              Talk through a project
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
