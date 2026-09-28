'use client'

import Link from 'next/link'
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ActionItem = {
  id: string
  title: string
  reason: string
  entityType: 'task' | 'invoice' | 'contract' | 'client' | 'message' | 'system'
  entityId: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  dueDate?: string
  actionLabel: string
  actionHref: string
}

interface ActionQueueProps {
  items: ActionItem[]
  title?: string
  onDismiss?: (id: string) => void
  className?: string
}

const priorityConfig: Record<string, { icon: LucideIcon; color: string; bg: string; border: string; label: string }> = {
  urgent: {
    icon: AlertCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    label: 'Urgent',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    label: 'High',
  },
  medium: {
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Medium',
  },
  low: {
    icon: CheckCircle2,
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    label: 'Low',
  },
}

const entityTypeColors: Record<string, string> = {
  task: 'text-amber-400',
  invoice: 'text-cyan-400',
  contract: 'text-rose-400',
  client: 'text-blue-400',
  message: 'text-indigo-400',
  system: 'text-white/40',
}

export function ActionQueue({ items, title = 'Action Queue', onDismiss, className }: ActionQueueProps) {
  if (items.length === 0) {
    return (
      <div className={cn('p-6 bg-white/5 border border-white/10 text-center', className)}>
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
        <p className="text-sm text-white/50 font-sans">All caught up</p>
        <p className="text-xs text-white/30 font-mono mt-1">No actions need attention</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-white/5 border border-white/10', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">{title}</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent rounded-sm">
            {items.length}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-white/5">
        {items.map((item) => {
          const priority = priorityConfig[item.priority]
          const PriorityIcon = priority.icon

          return (
            <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors">
              {/* Priority indicator */}
              <div className={cn('w-8 h-8 flex items-center justify-center flex-shrink-0', priority.bg, priority.border, 'border')}>
                <PriorityIcon className={cn('w-4 h-4', priority.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-sans truncate">{item.title}</p>
                  <span className={cn('text-[10px] font-mono uppercase', entityTypeColors[item.entityType] || 'text-white/40')}>
                    {item.entityType}
                  </span>
                </div>
                <p className="text-xs text-white/40 font-mono mt-0.5">{item.reason}</p>
                {item.dueDate && (
                  <p className="text-[10px] text-white/30 font-mono mt-1">Due: {item.dueDate}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={item.actionHref}
                  className="flex items-center gap-1 px-2 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono uppercase tracking-wider hover:bg-accent/20 transition-colors"
                >
                  {item.actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </Link>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(item.id)}
                    className="p-1 text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
