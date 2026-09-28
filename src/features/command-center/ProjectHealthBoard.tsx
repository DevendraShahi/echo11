import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ProjectHealthSummary } from '@/lib/frontend/view-models'

interface ProjectHealthBoardProps {
  projects: ProjectHealthSummary[]
}

const healthColors: Record<string, { color: string; bg: string; border: string; label: string }> = {
  healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Healthy' },
  at_risk: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'At Risk' },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Critical' },
}

export function ProjectHealthBoard({ projects }: ProjectHealthBoardProps) {
  if (projects.length === 0) {
    return (
      <div className="p-8 bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-white/50 font-sans">No active projects</p>
        <p className="text-xs text-white/30 font-mono mt-1">Create a project to see health status</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Project Health</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/20 text-white/70 rounded-sm">
            {projects.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {projects.map((project) => {
          const health = healthColors[project.health.status]

          return (
            <div key={project.projectId} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/lab/projects/${project.projectId}`} className="text-sm font-medium text-white font-sans hover:text-accent transition-colors truncate">
                      {project.name}
                    </Link>
                    <span className={cn('px-1.5 py-0.5 text-[10px] font-mono uppercase border rounded-sm', health.color, health.bg, health.border)}>
                      {health.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-mono">{project.clientName}</p>
                  {project.health.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.health.reasons.map((reason, i) => (
                        <span key={i} className="text-[10px] text-white/30 font-mono bg-white/5 px-1.5 py-0.5 border border-white/10">
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-foreground font-sans">{project.progress}%</span>
                  </div>
                  <div className="w-24 h-1 bg-white/10">
                    <div
                      className={cn('h-full', project.progress >= 70 ? 'bg-emerald-400' : project.progress >= 40 ? 'bg-amber-400' : 'bg-rose-400')}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  {project.dueDate && (
                    <p className="text-[10px] text-white/30 font-mono mt-1">Due {project.dueDate}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
