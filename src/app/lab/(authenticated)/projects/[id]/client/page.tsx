import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, ExternalLink, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { DataState } from '@/components/lab/primitives/DataState'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { getClientProjectSummary, getProjectAccess, getProjectWorkspace } from '@/features/lab/workspace/data'
import { ProjectSectionHeader } from '../ProjectSectionHeader'
import { ProjectSubpageShell } from '../ProjectSubpageShell'

export default async function ProjectClientBriefPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)

  if (!project) {
    notFound()
  }

  const access = await getProjectAccess(id, project.team_id)
  if (!access.canAccess) {
    notFound()
  }

  if (!project.client) {
    return (
      <ProjectSubpageShell>
        <div className="space-y-6">
          <ProjectSectionHeader
            project={project}
            title={`${project.name} Client`}
            subtitle="Client brief, account context, and relationship snapshot"
            icon={Building2}
          />
          <DataState
            title="No client linked"
            description="Assign a client to this project to unlock client brief, billing context, and contract visibility."
            icon={Building2}
          />
        </div>
      </ProjectSubpageShell>
    )
  }

  const summary = await getClientProjectSummary(project.client.id)

  return (
    <ProjectSubpageShell>
      <div className="space-y-6">
        <ProjectSectionHeader
          project={project}
          title={project.client.company_name}
          subtitle={`Client brief for ${project.name}`}
          icon={Building2}
          action={
            <Link href={`/lab/clients/${project.client.id}`} className="inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-3 py-2 text-xs uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20">
              Open Client Profile
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          }
        />

        <MetricStrip
          items={[
            { label: 'Active Projects', value: summary.activeProjects, hint: `${summary.projectCount} total` },
            { label: 'Paid Revenue', value: `$${summary.totalRevenue.toLocaleString()}`, tone: 'success' },
            { label: 'Pending Revenue', value: `$${summary.pendingRevenue.toLocaleString()}`, tone: 'warning' },
            { label: 'Signed Contracts', value: summary.signedContracts, hint: `$${summary.contractValue.toLocaleString()}` },
          ]}
        />

        <PanelSection title="Contact Snapshot" description="Core client information for fast execution context">
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/5 md:grid-cols-2">
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Primary Contact</p>
              <p className="mt-1 text-sm text-foreground font-sans">{project.client.contact_name || 'Not set'}</p>
            </div>
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Industry</p>
              <p className="mt-1 text-sm text-foreground font-sans">{project.client.industry || 'Not set'}</p>
            </div>
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Email</p>
              <a href={`mailto:${project.client.email}`} className="mt-1 inline-flex items-center gap-2 text-sm text-accent font-mono hover:text-accent/80">
                <Mail className="h-3.5 w-3.5" />
                {project.client.email}
              </a>
            </div>
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Phone</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-foreground font-mono">
                <Phone className="h-3.5 w-3.5 text-white/45" />
                {project.client.phone || 'Not set'}
              </p>
            </div>
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Website</p>
              {project.client.website ? (
                <a
                  href={project.client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm text-accent font-mono hover:text-accent/80"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {project.client.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <p className="mt-1 text-sm text-white/55 font-mono">Not set</p>
              )}
            </div>
            <div className="bg-black/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">Address</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-foreground font-mono">
                <MapPin className="h-3.5 w-3.5 text-white/45" />
                {project.client.address || 'Not set'}
              </p>
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Project Notes" description="Execution cues surfaced from client metadata">
          <p className="text-sm text-white/70 font-sans leading-relaxed">{project.client.notes || 'No client notes available for this project.'}</p>
        </PanelSection>
      </div>
    </ProjectSubpageShell>
  )
}
