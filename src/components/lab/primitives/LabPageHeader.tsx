import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LabPageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function LabPageHeader({ title, description, icon: Icon, action, className }: LabPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 border border-white/20 bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(0,229,255,0.02))] flex items-center justify-center">
              <Icon className="h-5 w-5 text-accent" />
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight font-sans text-foreground md:text-3xl">{title}</h1>
        </div>
        {description ? <p className="text-sm text-white/55 font-mono">{description}</p> : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </header>
  )
}
