import { notFound } from 'next/navigation'
import { Activity } from 'lucide-react'
import { DataState } from '@/components/lab/primitives/DataState'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { getProjectAccess, getProjectActivities, getProjectWorkspace } from '@/features/lab/workspace/data'
import { ProjectSectionHeader } from '../ProjectSectionHeader'
import { ProjectSubpageShell } from '../ProjectSubpageShell'

function formatDistanceFromNow(value: string): string {
  const target = new Date(value).getTime()
  if (Number.isNaN(target)) return 'just now'
  const diffMs = target - Date.now()
  const absSec = Math.round(Math.abs(diffMs) / 1000)
  const absMin = Math.round(absSec / 60)
  const absHour = Math.round(absMin / 60)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  if (absMin < 60) return rtf.format(Math.round(diffMs / (1000 * 60)), 'minute')
  if (absHour < 24) return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), 'hour')
  return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), 'day')
}

export default async function ProjectActivityPage({
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

  const activity = await getProjectActivities(id)

  return (
    <ProjectSubpageShell>
      <div className="space-y-6">
        <ProjectSectionHeader
          project={project}
          title={`${project.name} Activity`}
          subtitle="Chronological audit stream of all project movement"
          icon={Activity}
        />

        <PanelSection title="Timeline" description="Latest actions and actor trail for this project">
          {activity.length === 0 ? (
            <DataState
              title="No project activity yet"
              description="Actions will appear here as tasks, meetings, invoices, and contracts are updated."
              icon={Activity}
            />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {activity.map((item) => {
                const actor = item.user as { full_name?: string | null } | null
                return (
                  <article key={item.id} className="flex flex-col gap-2 bg-black/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-foreground font-sans">
                      <span className="text-white/65">{actor?.full_name || 'Someone'}</span> {item.action}
                    </p>
                    <p className="text-xs text-white/40 font-mono">
                      {formatDistanceFromNow(item.created_at)}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </PanelSection>
      </div>
    </ProjectSubpageShell>
  )
}
