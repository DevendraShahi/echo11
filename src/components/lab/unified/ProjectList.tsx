import { Project, ProjectStatus } from '@/types/lab'
import { LabCard as Card, LabCardContent } from '@/components/ui/LabCard'
import { LabBadge } from '@/components/ui/LabBadge'
import { ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'

type ProjectWithClient = Partial<Project> & {
  client?: { company_name: string } | null
  tasks?: { status: string; priority: string }[]
}

interface ProjectListProps {
  projects: ProjectWithClient[]
  showClient?: boolean
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'ghost' | 'accent' }> = {
  active: { label: 'Active', variant: 'accent' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived: { label: 'Archived', variant: 'ghost' },
}

const calculateProgress = (project: ProjectWithClient) => {
  const tasks = project.tasks
  if (tasks && tasks.length > 0) {
    const weightMap: Record<string, number> = {
      low: 0.5,
      medium: 1,
      high: 2,
      urgent: 3
    }
    const totalWeight = tasks.reduce((sum, t) => sum + (weightMap[t.priority] || 0), 0)
    const completedWeight = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (weightMap[t.priority] || 0), 0)
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
  }

  return project.progress || 0
}

export function ProjectList({ projects, showClient = true }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 border border-white/10 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2 font-sans">No projects found</h3>
        <p className="text-sm text-white/50 font-sans">
          There are no projects matching this view.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const status = statusConfig[(project.status as ProjectStatus) || 'active']
        
        return (
          <Card key={project.id} className="group hover:bg-white/[0.07] transition-colors rounded-none">
            <LabCardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center border"
                  style={{ backgroundColor: `${project.color || '#00E5FF'}20`, borderColor: `${project.color || '#00E5FF'}30` }}
                >
                  <span className="text-lg font-bold font-sans" style={{ color: project.color || '#00E5FF' }}>
                    {(project.name || 'P').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground font-sans tracking-tight truncate">
                    {project.name}
                  </h3>
                  {showClient && (
                    <p className="text-sm text-white/50 font-sans truncate">
                      {project.client ? project.client.company_name : 'No client'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <LabBadge variant={status.variant}>
                  {status.label}
                </LabBadge>
                {project.deadline && (
                  <span className="flex items-center gap-1 font-mono text-xs text-white/50 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <div className="w-24 shrink-0 hidden sm:block">
                  <div className="flex items-center justify-between text-xs mb-1 font-sans">
                    <span className="text-white/40">{calculateProgress(project)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-none overflow-hidden">
                    <div
                      className="h-full rounded-none transition-all"
                      style={{ width: `${calculateProgress(project)}%`, backgroundColor: project.color || '#00E5FF' }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/lab/projects/${project.id}`}
                    className="p-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    title="View project details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </LabCardContent>
          </Card>
        )
      })}
    </div>
  )
}
