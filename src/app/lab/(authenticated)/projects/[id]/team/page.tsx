import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Mail, ShieldCheck, UserCog, Users } from 'lucide-react'
import { DataState } from '@/components/lab/primitives/DataState'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { getProjectAccess, getProjectTeamMembers, getProjectWorkspace } from '@/features/lab/workspace/data'
import { ProjectSectionHeader } from '../ProjectSectionHeader'
import { ProjectSubpageShell } from '../ProjectSubpageShell'

export default async function ProjectTeamPage({
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

  const members = await getProjectTeamMembers(id)
  const leadCount = members.filter((member) => member.role === 'lead').length
  const adminCount = members.filter((member) => member.role === 'admin').length
  const memberCount = members.filter((member) => member.role === 'member').length

  return (
    <ProjectSubpageShell>
      <div className="space-y-6">
        <ProjectSectionHeader
          project={project}
          title={`${project.name} Team`}
          subtitle="Role map and delivery ownership across the project team"
          icon={Users}
        />

        <MetricStrip
          items={[
            { label: 'Assigned People', value: members.length || 0 },
            { label: 'Leads', value: leadCount, tone: 'accent' },
            { label: 'Admins', value: adminCount, tone: 'warning' },
            { label: 'Members', value: memberCount, tone: 'default' },
          ]}
        />

        <PanelSection title="Project Team Roster" description="Role and contact context for project execution">
          {members.length === 0 ? (
            <DataState
              title="No team members assigned"
              description="Assign tasks to team members to build a clear project roster."
              icon={Users}
            />
          ) : (
            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/5 md:grid-cols-2">
              {members.map((member) => (
                <article key={member.id} className="flex items-center justify-between gap-3 bg-black/60 p-4">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={`${member.full_name || 'Team member'} avatar`}
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 border border-white/20 object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center border border-accent/30 bg-accent/10 text-[11px] font-mono text-accent">
                        {(member.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-foreground font-sans">{member.full_name || 'Unknown member'}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'lead' ? (
                      <span className="inline-flex items-center gap-1 border border-cyan-400/25 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-cyan-300 font-mono">
                        <UserCog className="h-3 w-3" />
                        Lead
                      </span>
                    ) : null}
                    {member.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-amber-300 font-mono">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </span>
                    ) : null}
                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono hover:text-accent hover:border-accent/30"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </PanelSection>
      </div>
    </ProjectSubpageShell>
  )
}
