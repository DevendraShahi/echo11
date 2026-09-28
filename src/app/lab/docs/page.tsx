import { BookOpen, Building2, CheckSquare, DollarSign, MessageSquare, Settings } from 'lucide-react'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'

export const metadata = {
  title: 'Lab Architecture Guide | echo11Lab',
  description: 'Operating guide for the rebuilt project-centric /lab architecture.',
}

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <LabPageHeader
        title="Lab Architecture Guide"
        description="Project-centric operating model, page responsibilities, and workflow standards"
        icon={BookOpen}
      />

      <MetricStrip
        items={[
          { label: 'Canonical Surfaces', value: '5', hint: 'command, projects, clients, messages, settings' },
          { label: 'Project Cockpit Tabs', value: '6', hint: 'overview, delivery, finance, client, team, activity' },
          { label: 'Primary Principle', value: 'In-Context', tone: 'accent', hint: 'Avoid cross-page route hopping' },
          { label: 'Architecture Goal', value: 'Single Source', hint: 'Shared primitives + feature modules' },
        ]}
      />

      <div id="surface-contracts" className="scroll-mt-24">
      <PanelSection title="1. Top-Level Surface Contracts" description="What each canonical page owns">
        <ul className="space-y-2 text-sm text-white/70 font-sans">
          <li><strong>Command:</strong> global operational pulse, alerts, and launch actions.</li>
          <li><strong>Projects:</strong> entry list for delivery workspaces and project creation.</li>
          <li><strong>Clients:</strong> relationship directory, status lifecycle, and client-level summaries.</li>
          <li><strong>Messages:</strong> client conversation queue and unread triage.</li>
          <li><strong>Settings:</strong> user and workspace configuration.</li>
        </ul>
      </PanelSection>
      </div>

      <div id="project-workflow" className="scroll-mt-24">
      <PanelSection title="2. Project-Centric Workflow" description="All execution work happens in project context">
        <ul className="space-y-2 text-sm text-white/70 font-sans">
          <li className="flex items-start gap-2"><CheckSquare className="mt-0.5 h-4 w-4 text-accent" /><span><strong>Delivery:</strong> kanban + task stream in one project workspace.</span></li>
          <li className="flex items-start gap-2"><DollarSign className="mt-0.5 h-4 w-4 text-accent" /><span><strong>Finance:</strong> invoices, contracts, and expense ledger tied to project margin visibility.</span></li>
          <li className="flex items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 text-accent" /><span><strong>Client:</strong> brief snapshot with direct bridge to full client profile.</span></li>
          <li className="flex items-start gap-2"><MessageSquare className="mt-0.5 h-4 w-4 text-accent" /><span><strong>Activity:</strong> traceable project action timeline.</span></li>
        </ul>
      </PanelSection>
      </div>

      <div id="frontend-rules" className="scroll-mt-24">
      <PanelSection title="3. Frontend Architecture Rules" description="Engineering standards for future /lab changes">
        <ul className="space-y-2 text-sm text-white/70 font-sans">
          <li>Use shared primitives (`LabPageHeader`, `MetricStrip`, `PanelSection`, `DataState`) before introducing custom wrappers.</li>
          <li>Route files should focus on data loading/composition; reusable behavior belongs in feature modules.</li>
          <li>Avoid duplicate page-level state machines for filtering/searching when existing patterns can be reused.</li>
          <li>Preserve industrial-editorial tokens: sharp borders, mono metadata, dense hierarchy, dark/cyan accent system.</li>
        </ul>
      </PanelSection>
      </div>

      <div id="navigation-boundaries" className="scroll-mt-24">
      <PanelSection title="4. Navigation Boundaries" description="What is intentionally not a primary nav destination">
        <ul className="space-y-2 text-sm text-white/70 font-sans">
          <li>Legacy split workflows (`/lab/tasks`, `/lab/invoices`, `/lab/contracts`, `/lab/dashboard`) are deprecated as top-level IA.</li>
          <li>Detail pages can still exist for deep links, but user journeys should begin from command/projects/clients/messages/settings.</li>
          <li>When adding new capabilities, first ask: does it belong in a project cockpit tab?</li>
        </ul>
      </PanelSection>
      </div>

      <div className="border border-white/10 bg-black/40 p-4 text-xs text-white/45 font-mono flex items-center gap-2">
        <Settings className="h-3.5 w-3.5 text-accent" />
        Keep this guide updated when /lab page responsibilities or canonical routes change.
      </div>
    </div>
  )
}
