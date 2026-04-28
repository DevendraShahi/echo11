import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ClientBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

interface ClientBadgeProps {
  children: ReactNode
  className?: string
  tone?: ClientBadgeTone
}

const toneStyles: Record<ClientBadgeTone, string> = {
  neutral: 'bg-white/10 text-white/60',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

export function ClientBadge({ children, className, tone = 'neutral' }: ClientBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function getProjectStatusTone(status: string): ClientBadgeTone {
  if (status === 'active') return 'success'
  if (status === 'completed') return 'info'
  if (status === 'on_hold') return 'warning'
  if (status === 'archived' || status === 'cancelled') return 'danger'
  return 'neutral'
}
