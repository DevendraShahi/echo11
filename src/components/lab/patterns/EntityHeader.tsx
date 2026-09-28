import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/lab/data-display/StatusBadge'

interface EntityHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  color?: string
  backLink?: string
  backLabel?: string
  status?: string
  entityType?: 'task' | 'project' | 'invoice' | 'contract' | 'client' | 'meeting' | 'health' | 'risk' | 'systemHealth' | 'capacity' | 'taskPriority'
  progress?: number
  metadata?: { label: string; value: string }[]
  badges?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function EntityHeader({
  title,
  subtitle,
  icon: Icon,
  color,
  backLink,
  backLabel = 'Back',
  status,
  entityType,
  progress,
  metadata,
  badges,
  actions,
  className,
}: EntityHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 mb-6', className)}>
      {backLink && (
        <div>
          <Link href={backLink} className="inline-flex items-center text-sm text-white/50 hover:text-accent transition-colors font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {(Icon || color) && (
            <div
              className="w-12 h-12 shrink-0 flex items-center justify-center border"
              style={{
                backgroundColor: color ? `${color}20` : 'rgba(255,255,255,0.05)',
                borderColor: color ? `${color}30` : 'rgba(255,255,255,0.1)',
              }}
            >
              {Icon ? (
                <Icon className="w-5 h-5" style={{ color: color || 'white' }} />
              ) : color ? (
                <span className="text-xl font-bold font-sans" style={{ color }}>
                  {title.charAt(0).toUpperCase()}
                </span>
              ) : null}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground font-sans tracking-tight">
                {title}
              </h1>
              {status && entityType && (
                <StatusBadge status={status} entityType={entityType} />
              )}
              {badges}
            </div>
            {subtitle && (
              <p className="text-sm text-white/50 font-sans mt-0.5">
                {subtitle}
              </p>
            )}
            {metadata && metadata.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {metadata.map((meta) => (
                  <span key={meta.label} className="text-xs font-mono text-white/40">
                    <span className="text-white/30">{meta.label}:</span> {meta.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10">
            <div
              className={cn(
                'h-full transition-all',
                progress >= 70 ? 'bg-emerald-400' : progress >= 40 ? 'bg-amber-400' : 'bg-rose-400'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white/40 w-10 text-right">{progress}%</span>
        </div>
      )}
    </div>
  )
}
