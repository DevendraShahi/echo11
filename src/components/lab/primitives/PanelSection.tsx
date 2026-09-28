import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PanelSectionProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PanelSection({ title, description, action, children, className, ...props }: PanelSectionProps) {
  return (
    <section className={cn('border border-white/10 bg-black/45', className)} {...props}>
      <header className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground font-sans">{title}</h2>
          {description ? <p className="text-xs text-white/45 font-mono mt-1">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}
