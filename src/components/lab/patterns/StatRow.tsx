import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatItem {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: string
  trend?: { value: number; isPositive: boolean }
}

interface StatRowProps {
  stats: StatItem[]
  className?: string
}

export function StatRow({ stats, className }: StatRowProps) {
  return (
    <div className={cn('grid gap-4', className || 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5')}>
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div key={stat.label} className="p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              {Icon && (
                <div className={cn('w-7 h-7 flex items-center justify-center border', stat.color ? `bg-${stat.color}-500/10 border-${stat.color}-500/20` : 'bg-white/5 border-white/10')}>
                  <Icon className={cn('w-3.5 h-3.5', stat.color ? `text-${stat.color}-400` : 'text-white/40')} />
                </div>
              )}
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">{stat.label}</p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-xl font-bold text-foreground font-sans">{stat.value}</p>
              {stat.trend && (
                <span className={cn(
                  'text-[10px] font-mono',
                  stat.trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
