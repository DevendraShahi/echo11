import Link from 'next/link'
import { LucideIcon, ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'

export interface EntityHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  color?: string
  backLink?: string
  backLabel?: string
  actions?: ReactNode
}

export function EntityHeader({
  title,
  subtitle,
  icon: Icon,
  color,
  backLink,
  backLabel = 'Back',
  actions
}: EntityHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {backLink && (
        <div>
          <Link href={backLink} className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {(Icon || color) && (
            <div
              className="w-14 h-14 shrink-0 flex items-center justify-center border"
              style={{ 
                backgroundColor: color ? `${color}20` : 'rgba(255,255,255,0.05)', 
                borderColor: color ? `${color}30` : 'rgba(255,255,255,0.1)' 
              }}
            >
              {Icon ? (
                <Icon className="w-6 h-6" style={{ color: color || 'white' }} />
              ) : color ? (
                <span className="text-2xl font-bold font-sans" style={{ color }}>
                  {title.charAt(0).toUpperCase()}
                </span>
              ) : null}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/50 font-sans mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
