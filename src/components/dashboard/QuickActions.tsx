'use client'

import { FolderKanban, CheckSquare, Calendar, FileText, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'

const actions = [
  {
    label: 'New Project',
    icon: FolderKanban,
    href: '/lab/projects/new',
    color: 'accent',
  },
  {
    label: 'New Task',
    icon: CheckSquare,
    href: '/lab/tasks?new=true',
    color: 'emerald',
  },
  {
    label: 'Schedule Meeting',
    icon: Calendar,
    href: '/lab/meetings/new',
    color: 'rose',
  },
  {
    label: 'Create Invoice',
    icon: FileText,
    href: '/lab/invoices/new',
    color: 'amber',
  },
  {
    label: 'Add Client',
    icon: Users,
    href: '/lab/clients/new',
    color: 'sky',
  },
]

const colorStyles = {
  accent: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', hover: 'hover:bg-accent/20' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', hover: 'hover:bg-rose-500/20' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:bg-amber-500/20' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', hover: 'hover:bg-sky-500/20' },
}

export function QuickActions() {
  return (
    <LabCard>
      <LabCardHeader className="pb-2" data-tour="quick-actions-header">
        <LabCardTitle className="text-lg font-semibold">Quick Actions</LabCardTitle>
      </LabCardHeader>
      <LabCardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" data-tour="quick-actions-buttons">
          {actions.map((action, index) => {
            const colors = colorStyles[action.color as keyof typeof colorStyles]
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={action.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-none border ${colors.bg} ${colors.border} ${colors.hover} hover:scale-105 transition-all duration-200`}
                >
                  <div className={`p-2 rounded-none border ${colors.bg} ${colors.border}`}>
                    <action.icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <span className="text-xs font-medium text-white/70 text-center">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </LabCardContent>
    </LabCard>
  )
}
