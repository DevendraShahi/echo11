import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ClientCard } from './ClientCard'
import { ClientBadge, getProjectStatusTone } from './ClientBadge'

interface ClientProjectCardProps {
  project: {
    id: string
    name: string
    description: string | null
    status: string
    progress: number
    color: string
    deadline: string | null
    start_date: string | null
  }
  href: string
  showStartDate?: boolean
}

export function ClientProjectCard({ project, href, showStartDate = true }: ClientProjectCardProps) {
  return (
    <Link href={href} className="group">
      <ClientCard interactive className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <span className="text-lg font-bold" style={{ color: project.color }}>
              {project.name.charAt(0)}
            </span>
          </div>
          <ClientBadge tone={getProjectStatusTone(project.status)}>{project.status}</ClientBadge>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-accent">
          {project.name}
        </h3>

        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-white/50">{project.description}</p>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-white/50">Progress</span>
            <span className="font-mono text-white">{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-white/10">
            <div
              className="h-full transition-all"
              style={{ width: `${project.progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        {(showStartDate || project.deadline) && (
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            {showStartDate && project.start_date ? (
              <p className="text-xs text-white/30">Started {format(new Date(project.start_date), 'MMM d')}</p>
            ) : (
              <span />
            )}

            {project.deadline ? (
              <p className="flex items-center gap-1 text-xs text-white/30">
                <Clock className="h-3 w-3" />
                Due {format(new Date(project.deadline), 'MMM d, yyyy')}
              </p>
            ) : (
              <ArrowRight className="h-4 w-4 text-white/30 transition-colors group-hover:text-accent" />
            )}
          </div>
        )}
      </ClientCard>
    </Link>
  )
}
