import type { ReactNode } from 'react'

interface ClientSectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function ClientSectionHeader({ title, description, action, className }: ClientSectionHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white font-sans">{title}</h2>
          {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
