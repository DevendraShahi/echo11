'use client'

import { LucideIcon } from 'lucide-react'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, action, className }: PageHeaderProps) {
  return (
    <LabPageHeader
      title={title}
      description={description}
      icon={icon}
      action={action}
      className={className}
    />
  )
}
