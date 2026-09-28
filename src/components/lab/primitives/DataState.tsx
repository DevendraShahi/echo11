import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function DataState({ title, description, icon: Icon, action, className }: DataStateProps) {
  return (
    <section className={cn('border border-white/10 bg-black/55 px-6 py-14 text-center', className)}>
      {Icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/15 bg-white/5">
          <Icon className="h-5 w-5 text-white/40" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-foreground font-sans">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/50 font-mono">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  )
}
