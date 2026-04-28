import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientCard } from './ClientCard'

type ClientStatTone = 'accent' | 'success' | 'warning' | 'info'

interface ClientStatCardProps {
  icon: LucideIcon
  label: string
  value: string
  tone?: ClientStatTone
  className?: string
}

const toneStyles: Record<ClientStatTone, string> = {
  accent: 'bg-accent/10 border-accent/20 text-accent',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
}

export function ClientStatCard({
  icon: Icon,
  label,
  value,
  tone = 'accent',
  className,
}: ClientStatCardProps) {
  return (
    <ClientCard className={cn('p-5', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 border', toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
          <p className="text-2xl font-bold text-white font-sans">{value}</p>
        </div>
      </div>
    </ClientCard>
  )
}
