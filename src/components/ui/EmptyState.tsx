'use client'

import { LucideIcon, FolderOpen } from 'lucide-react'
import { LabButton } from '@/components/ui/LabButton'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon = FolderOpen, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-4",
      className
    )}>
      <div className="w-16 h-16 bg-white/[0.03] rounded-none flex items-center justify-center mb-5 border border-white/8">
        <Icon className="w-8 h-8 text-white/25" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 font-sans text-center">
        {title}
      </h3>
      {description && (
        <p className="text-white/40 mb-6 text-center max-w-sm font-sans">
          {description}
        </p>
      )}
      {action && (
        <LabButton onClick={action.onClick} className="font-sans">
          {action.label}
        </LabButton>
      )}
    </div>
  )
}
