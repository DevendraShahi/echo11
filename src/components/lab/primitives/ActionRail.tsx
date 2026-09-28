import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionRailItem {
  label: string
  hint?: string
  href: string
  icon: LucideIcon
}

interface ActionRailProps {
  items: ActionRailItem[]
  className?: string
}

export function ActionRail({ items, className }: ActionRailProps) {
  return (
    <section className={cn('grid grid-cols-1 gap-px border border-white/10 bg-white/5 md:grid-cols-2 xl:grid-cols-4', className)}>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group bg-black/60 px-4 py-3 transition-colors hover:bg-white/[0.06]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-white/5 group-hover:border-accent/35 group-hover:text-accent">
              <item.icon className="h-4 w-4 text-white/55 group-hover:text-accent" />
            </div>
            <div>
              <p className="text-sm text-foreground font-sans">{item.label}</p>
              {item.hint ? <p className="text-[11px] text-white/40 font-mono">{item.hint}</p> : null}
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}
