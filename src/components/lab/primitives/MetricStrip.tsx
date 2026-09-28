import { cn } from '@/lib/utils'

export interface MetricStripItem {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
}

interface MetricStripProps {
  items: MetricStripItem[]
  className?: string
}

const toneClass: Record<NonNullable<MetricStripItem['tone']>, string> = {
  default: 'text-foreground',
  accent: 'text-accent',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
}

export function MetricStrip({ items, className }: MetricStripProps) {
  return (
    <section className={cn('grid grid-cols-2 gap-px border border-white/10 bg-white/5 lg:grid-cols-4', className)}>
      {items.map((item) => (
        <article key={item.label} className="bg-black/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45 font-mono">{item.label}</p>
          <p className={cn('mt-1 text-xl font-semibold font-sans', toneClass[item.tone || 'default'])}>{item.value}</p>
          {item.hint ? <p className="mt-1 text-[11px] text-white/35 font-mono">{item.hint}</p> : null}
        </article>
      ))}
    </section>
  )
}
