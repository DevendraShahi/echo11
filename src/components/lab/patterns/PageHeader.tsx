'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  CheckSquare,
  Users,
  FileText,
  CalendarDays,
  Activity,
  Settings,
  Edit,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PAGE_HEADER_ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  work: Briefcase,
  tasks: CheckSquare,
  teams: Users,
  documents: FileText,
  meetings: CalendarDays,
  activity: Activity,
  settings: Settings,
  edit: Edit,
} as const

export type PageHeaderIconName = keyof typeof PAGE_HEADER_ICONS

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconName?: PageHeaderIconName
  backLink?: string
  backLabel?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconName,
  backLink,
  backLabel,
  action,
  className,
}: PageHeaderProps) {
  const HeaderIcon = Icon ?? (iconName ? PAGE_HEADER_ICONS[iconName] : undefined)

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 mb-6 border-b border-white/5', className)}>
      <div className="flex items-start gap-4">
        {backLink && (
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors mt-0.5 font-mono text-xs uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel && <span>{backLabel}</span>}
          </Link>
        )}
        <div>
          <div className="flex items-center gap-3">
            {HeaderIcon && (
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
                <HeaderIcon className="w-5 h-5 text-accent" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground font-sans tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm text-white/50 font-mono mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
