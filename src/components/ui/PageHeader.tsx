'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
      <div>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-none bg-accent/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-accent" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-white/50 mt-1 font-sans">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
