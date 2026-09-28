'use client'

import { useState } from 'react'
import { CheckSquare, Calendar, User, Clock, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/lab/data-display/StatusBadge'

interface TaskCardProps {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assigneeName?: string
  dueDate?: string
  projectName?: string
  onClick?: () => void
  onStatusChange?: (id: string, status: string) => void
  compact?: boolean
}

const priorityIcons: Record<string, typeof AlertCircle> = {
  urgent: AlertCircle,
  high: AlertTriangle,
  medium: Clock,
  low: CheckSquare,
}

const priorityColors: Record<string, string> = {
  urgent: 'text-rose-400',
  high: 'text-amber-400',
  medium: 'text-blue-400',
  low: 'text-white/40',
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  assigneeName,
  dueDate,
  projectName,
  onClick,
  onStatusChange,
  compact = false,
}: TaskCardProps) {
  const [hovered, setHovered] = useState(false)
  const PriorityIcon = priorityIcons[priority] || CheckSquare
  const priorityColor = priorityColors[priority] || 'text-white/40'
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'done'
  const isDone = status === 'done'

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 bg-white/5 border border-white/10 cursor-pointer transition-all duration-200',
          hovered ? 'bg-white/[0.07] border-accent/20' : '',
          isDone ? 'opacity-50' : ''
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onClick?.()}
      >
        <button
          className={cn(
            'w-5 h-5 flex items-center justify-center border flex-shrink-0 transition-colors',
            isDone ? 'bg-accent border-accent text-black' : 'border-white/20 hover:border-accent'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange?.(id, isDone ? 'todo' : 'done')
          }}
        >
          {isDone && <CheckSquare className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-sans truncate', isDone ? 'line-through text-white/30' : 'text-white')}>
            {title}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityIcon className={cn('w-3 h-3', priorityColor)} />
          {dueDate && (
            <span className={cn('text-[10px] font-mono', isOverdue ? 'text-rose-400' : 'text-white/30')}>
              {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-4 bg-white/5 border border-white/10 cursor-pointer transition-all duration-200',
        hovered ? 'bg-white/[0.07] border-accent/20' : '',
        isDone ? 'opacity-60' : ''
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.()}
    >
      <div className="flex items-start gap-3">
        <button
          className={cn(
            'w-5 h-5 flex items-center justify-center border flex-shrink-0 mt-0.5 transition-colors',
            isDone ? 'bg-accent border-accent text-black' : 'border-white/20 hover:border-accent'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onStatusChange?.(id, isDone ? 'todo' : 'done')
          }}
        >
          {isDone && <CheckSquare className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm font-semibold text-foreground font-sans', isDone && 'line-through text-white/30')}>
              {title}
            </p>
            <StatusBadge status={status} entityType="task" />
          </div>

          {description && (
            <p className="text-xs text-white/40 font-sans mt-1 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-[10px] font-mono text-white/30">
            <span className={cn('flex items-center gap-1', priorityColor)}>
              <PriorityIcon className="w-3 h-3" />
              {priority}
            </span>
            {assigneeName && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {assigneeName}
              </span>
            )}
            {dueDate && (
              <span className={cn('flex items-center gap-1', isOverdue && 'text-rose-400')}>
                <Calendar className="w-3 h-3" />
                {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {isOverdue && ' (overdue)'}
              </span>
            )}
            {projectName && (
              <span className="truncate">
                {projectName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
