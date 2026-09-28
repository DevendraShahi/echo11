'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { entityTypeConfig } from '@/lib/frontend/status'
import {
  FolderKanban,
  CheckSquare,
  Users,
  Receipt,
  FileSignature,
  Calendar,
  MessageSquare,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'

interface EntityBadgeProps {
  type: 'project' | 'task' | 'client' | 'invoice' | 'contract' | 'meeting' | 'message' | 'system'
  id: string
  name: string
  href?: string
  size?: 'sm' | 'md'
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  project: FolderKanban,
  task: CheckSquare,
  client: Users,
  invoice: Receipt,
  contract: FileSignature,
  meeting: Calendar,
  message: MessageSquare,
  system: AlertCircle,
}

export function EntityBadge({ type, id, name, href, size = 'sm', className }: EntityBadgeProps) {
  const config = entityTypeConfig[type] || entityTypeConfig.system
  const Icon = iconMap[type] || AlertCircle

  const content = (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn('w-6 h-6 flex items-center justify-center bg-white/5', config.color)}>
        <Icon className="w-3 h-3" />
      </div>
      <div>
        <p className={cn('font-sans truncate', size === 'sm' ? 'text-xs' : 'text-sm', 'text-white')}>{name}</p>
        <p className="text-[10px] text-white/30 font-mono">{config.label} · {id.slice(0, 8)}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:bg-white/5 transition-colors p-1 -m-1">
        {content}
      </Link>
    )
  }

  return content
}
