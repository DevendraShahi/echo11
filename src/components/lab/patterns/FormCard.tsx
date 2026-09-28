import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface FormCardProps {
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function FormCard({ title, description, actions, className, children }: FormCardProps) {
  return (
    <div className={cn('bg-white/5 border border-white/10', className)}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-white/5">
          {title && (
            <h2 className="text-sm font-semibold text-foreground font-sans">{title}</h2>
          )}
          {description && (
            <p className="text-xs text-white/40 font-mono mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>

      {actions && (
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}
