import { FolderKanban, CheckSquare, Receipt, DollarSign, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BusinessMetrics } from '@/lib/frontend/view-models'

interface BusinessMetricsSectionProps {
  metrics: BusinessMetrics
  showRevenue: boolean
}

const metricConfig = [
  {
    key: 'activeProjects',
    label: 'Active Projects',
    icon: FolderKanban,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    key: 'openTasks',
    label: 'Open Tasks',
    icon: CheckSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    key: 'pendingInvoices',
    label: 'Pending Invoices',
    icon: Receipt,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'revenueThisMonth',
    label: 'Revenue (Month)',
    icon: DollarSign,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    format: (v: number) => `$${v.toLocaleString()}`,
  },
  {
    key: 'atRiskClients',
    label: 'At-Risk Clients',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
]

export function BusinessMetricsSection({ metrics, showRevenue }: BusinessMetricsSectionProps) {
  const visibleMetrics = showRevenue ? metricConfig : metricConfig.filter(m => m.key !== 'revenueThisMonth')

  return (
    <div className={cn('grid gap-4', showRevenue ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')}>
      {visibleMetrics.map(({ key, label, icon: Icon, color, bg, border, format }) => {
        const value = metrics[key as keyof BusinessMetrics]
        const displayValue = format ? format(value as number) : (value as number).toLocaleString()

        return (
          <div key={key} className="p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-8 h-8 flex items-center justify-center border', bg, border)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-white/50">{label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground font-sans">{displayValue}</p>
          </div>
        )
      })}
    </div>
  )
}
