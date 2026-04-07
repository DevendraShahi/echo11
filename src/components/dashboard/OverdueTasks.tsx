'use client'

import Link from 'next/link'
import { isPast } from 'date-fns'
import { AlertCircle, CheckSquare, ArrowRight } from 'lucide-react'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { Task, TaskPriority } from '@/types/lab'

interface OverdueTasksProps {
  tasks?: Task[]
}

const priorityConfig: Record<TaskPriority, { bg: string; text: string; label: string; border: string }> = {
  low: { bg: 'bg-white/10', text: 'text-white/50', label: 'Low', border: 'border-white/10' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Medium', border: 'border-blue-500/20' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'High', border: 'border-amber-500/20' },
  urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Urgent', border: 'border-rose-500/20' },
}

export function OverdueTasks({ tasks: initialTasks }: OverdueTasksProps) {
  const tasks = initialTasks || [
    { id: '1', title: 'Fix navigation bug', priority: 'high' as TaskPriority, due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), project: { name: 'TrueLuxe Website' } },
    { id: '2', title: 'Update payment integration', priority: 'urgent' as TaskPriority, due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), project: { name: 'Prika App' } },
    { id: '3', title: 'Review design mockups', priority: 'medium' as TaskPriority, due_date: new Date().toISOString(), project: { name: 'Leaders NP' } },
  ]

  const overdueTasks = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)))
  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false
    const today = new Date()
    const due = new Date(t.due_date)
    return due.toDateString() === today.toDateString()
  })

  return (
    <LabCard>
      <LabCardHeader className="flex flex-row items-center justify-between pb-2">
        <LabCardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Due Soon
        </LabCardTitle>
        <Link href="/lab/tasks?filter=overdue" className="text-sm text-accent hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </LabCardHeader>
      <LabCardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <p className="text-white/50">No tasks due soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-rose-400 uppercase tracking-wide mb-2">
                  Overdue ({overdueTasks.length})
                </p>
                {overdueTasks.slice(0, 2).map((task) => {
                  const priority = priorityConfig[task.priority]
                  return (
                    <Link
                      key={task.id}
                      href={`/lab/tasks/${task.id}`}
                      className="block group"
                    >
                      <div className={`flex items-center gap-3 p-3 rounded-none hover:bg-white/5 transition-colors border-l-2 ${priority.border.replace('border-', 'border-l-')}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {task.title}
                          </p>
                          <p className="text-sm text-white/50">
                            {task.project?.name}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-none ${priority.bg} ${priority.text}`}>
                          {priority.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            
            {todayTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-2">
                  Due Today ({todayTasks.length})
                </p>
                {todayTasks.slice(0, 2).map((task) => {
                  const priority = priorityConfig[task.priority]
                  return (
                    <Link
                      key={task.id}
                      href={`/lab/tasks/${task.id}`}
                      className="block group"
                    >
                      <div className={`flex items-center gap-3 p-3 rounded-none hover:bg-white/5 transition-colors border-l-2 border-amber-500/30`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {task.title}
                          </p>
                          <p className="text-sm text-white/50">
                            {task.project?.name}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-none ${priority.bg} ${priority.text}`}>
                          {priority.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </LabCardContent>
    </LabCard>
  )
}
