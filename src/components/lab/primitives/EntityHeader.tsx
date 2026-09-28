import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'

interface EntityHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  status?: string | null
  backHref: string
  backLabel: string
  action?: React.ReactNode
}

export function EntityHeader({ title, subtitle, icon: Icon, status, backHref, backLabel, action }: EntityHeaderProps) {
  return (
    <header className="space-y-4 border border-white/10 bg-black/45 p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/45 hover:text-accent font-mono">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="mt-1 flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5">
              <Icon className="h-5 w-5 text-accent" />
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-sans text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-white/55 font-mono">{subtitle}</p> : null}
          </div>
        </div>
        {status ? (
          <span className="border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-accent font-mono">
            {status.replace('_', ' ')}
          </span>
        ) : null}
      </div>
    </header>
  )
}
