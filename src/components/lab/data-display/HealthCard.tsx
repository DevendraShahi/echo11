'use client'

import { cn } from '@/lib/utils'
import { getStatusConfig } from '@/lib/frontend/status'
import { type LucideIcon } from 'lucide-react'

interface HealthCardProps {
  title: string
  status: 'healthy' | 'delayed' | 'degraded' | 'action_required'
  details?: string[]
  icon?: LucideIcon
  className?: string
}

export function HealthCard({ title, status, details, icon: CustomIcon, className }: HealthCardProps) {
  const config = getStatusConfig(status, 'systemHealth')
  const Icon = CustomIcon || config.icon

  return (
    <div className={cn('p-4 bg-white/5 border border-white/10', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-8 h-8 flex items-center justify-center', config.bg, config.border, 'border')}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div>
          <p className="text-sm text-white font-sans">{title}</p>
          <p className={cn('text-xs font-mono uppercase tracking-wider', config.color)}>{config.label}</p>
        </div>
      </div>
      {details && details.length > 0 && (
        <div className="space-y-1 mt-3 pt-3 border-t border-white/5">
          {details.map((detail, i) => (
            <p key={i} className="text-xs text-white/40 font-mono">{detail}</p>
          ))}
        </div>
      )}
    </div>
  )
}
