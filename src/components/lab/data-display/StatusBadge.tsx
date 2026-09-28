'use client'

import { cn } from '@/lib/utils'
import { getStatusConfig } from '@/lib/frontend/status'
import type { LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  entityType?: 'task' | 'project' | 'invoice' | 'contract' | 'client' | 'meeting' | 'health' | 'risk' | 'systemHealth' | 'capacity' | 'taskPriority'
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, entityType = 'task', size = 'sm', className }: StatusBadgeProps) {
  const config = getStatusConfig(status, entityType)
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-mono uppercase tracking-wider',
        config.bg,
        config.border,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  )
}

interface CustomStatusBadgeProps {
  label: string
  color: string
  bg: string
  border: string
  icon?: LucideIcon
  size?: 'sm' | 'md'
  className?: string
}

export function CustomStatusBadge({ label, color, bg, border, icon: Icon, size = 'sm', className }: CustomStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border font-mono uppercase tracking-wider',
        bg,
        border,
        color,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {label}
    </span>
  )
}
