import { cn } from '@/lib/utils'
import { type HTMLAttributes, type ReactNode } from 'react'

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  count?: number
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function Section({ title, count, action, className, children, ...rest }: SectionProps) {
  return (
    <div className={cn('space-y-3', className)} {...rest}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-white">{title}</h2>
          {count !== undefined && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/20 text-white/60 rounded-sm">
              {count}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
