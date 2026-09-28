import Link from 'next/link'
import { Calendar, ExternalLink, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/lab/data-display/StatusBadge'

interface ProjectCardProps {
  id: string
  name: string
  description?: string
  status: string
  type?: string
  budget?: number
  startDate?: string
  deadline?: string
  progress: number
  color: string
  clientName?: string
  clientContactName?: string
  link?: string
  taskStats?: { total: number; done: number; overdue: number }
  canEdit?: boolean
  onDelete?: (id: string) => void
  variant?: 'grid' | 'list'
}

export function ProjectCard({
  id,
  name,
  description,
  status,
  type,
  deadline,
  progress,
  color,
  clientName,
  link,
  taskStats,
  canEdit = false,
  onDelete,
  variant = 'grid',
}: ProjectCardProps) {
  if (variant === 'list') {
    return (
      <div className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-accent/20 transition-all duration-200">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: `${color}20`, borderColor: `${color}30` }}
          >
            <span className="text-lg font-bold font-sans" style={{ color }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/lab/projects/${id}`} className="text-sm font-semibold text-foreground font-sans hover:text-accent transition-colors truncate block">
              {name}
            </Link>
            <p className="text-xs text-white/40 font-mono mt-0.5">
              {clientName || 'No client'}{type ? ` • ${type}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <StatusBadge status={status} entityType="project" />
          {deadline && (
            <span className="flex items-center gap-1 font-mono text-xs text-white/40">
              <Calendar className="w-3 h-3" />
              {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <div className="w-20">
            <div className="h-1 bg-white/10">
              <div
                className="h-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-[10px] text-white/30 font-mono text-right mt-0.5">{progress}%</p>
          </div>
          {taskStats && (
            <span className="text-xs font-mono text-white/40">
              {taskStats.done}/{taskStats.total}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Link href={`/lab/projects/${id}`} className="p-1.5 hover:bg-white/5 transition-colors">
              <ExternalLink className="w-3.5 h-3.5 text-white/40" />
            </Link>
            {canEdit && (
              <>
                <Link href={`/lab/projects/${id}/edit`} className="p-1.5 hover:bg-white/5 transition-colors">
                  <Edit className="w-3.5 h-3.5 text-white/40" />
                </Link>
                {onDelete && (
                  <button onClick={() => onDelete(id)} className="p-1.5 hover:bg-white/5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-accent/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.08)]">
      <div className="absolute top-0 left-0 w-1 h-full group-hover:w-1.5 transition-all duration-300" style={{ backgroundColor: color }} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center border"
            style={{ backgroundColor: `${color}20`, borderColor: `${color}30` }}
          >
            <span className="text-lg font-bold font-sans" style={{ color }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          {canEdit && (
            <div className="relative">
              <button className="p-1 hover:bg-white/5 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-white/30" />
              </button>
            </div>
          )}
        </div>

        <Link href={`/lab/projects/${id}`} className="text-sm font-semibold text-foreground font-sans hover:text-accent transition-colors block mb-1 truncate">
          {name}
        </Link>
        <p className="text-xs text-white/40 font-mono mb-3 line-clamp-2">
          {description || 'No description'}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={status} entityType="project" />
          {type && (
            <span className="text-[10px] text-white/30 font-mono bg-white/5 px-1.5 py-0.5 border border-white/10">
              {type}
            </span>
          )}
        </div>

        {clientName && (
          <div className="flex items-center gap-2 mb-4 text-xs text-white/50 font-sans">
            <span className="w-2 h-2 bg-accent" />
            {clientName}
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1 font-sans">
            <span className="text-white/40">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10">
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {taskStats && (
          <div className="flex items-center justify-between text-[10px] font-mono text-white/30 mb-4 pt-3 border-t border-white/5">
            <span>{taskStats.done}/{taskStats.total} tasks</span>
            {taskStats.overdue > 0 && (
              <span className="text-rose-400">{taskStats.overdue} overdue</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <Link href={`/lab/projects/${id}`} className="text-xs font-medium text-accent hover:underline font-sans">
            View Details
          </Link>
          <div className="flex items-center gap-2">
            {deadline && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-white/30">
                <Calendar className="w-3 h-3" />
                {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-accent transition-colors">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
