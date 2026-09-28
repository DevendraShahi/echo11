import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientRiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  signalCount?: number
  compact?: boolean
}

const riskConfig: Record<string, { color: string; bg: string; border: string; label: string; icon: typeof AlertTriangle }> = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low', icon: AlertTriangle },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium', icon: AlertTriangle },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High', icon: AlertTriangle },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Critical', icon: AlertTriangle },
}

export function ClientRiskBadge({ level, score, signalCount, compact = false }: ClientRiskBadgeProps) {
  const config = riskConfig[level]

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase border rounded-sm', config.color, config.bg, config.border)}>
        <AlertTriangle className="w-2.5 h-2.5" />
        {config.label}
      </span>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2 px-2 py-1 border', config.bg, config.border)}>
      <AlertTriangle className={cn('w-3.5 h-3.5', config.color)} />
      <div>
        <span className={cn('text-xs font-mono uppercase font-semibold', config.color)}>{config.label}</span>
        <span className="text-[10px] text-white/30 font-mono ml-1">score {score}</span>
        {signalCount !== undefined && (
          <span className="text-[10px] text-white/30 font-mono ml-1">{signalCount} signal{signalCount !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}
