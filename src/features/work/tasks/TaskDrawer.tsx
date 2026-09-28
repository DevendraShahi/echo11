'use client'

import { useState } from 'react'
import { X, Calendar, User, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/lab/data-display/StatusBadge'
import { motion, AnimatePresence } from 'framer-motion'
import { updateTask } from '@/lib/actions/task-actions'
import { TaskPriority, TaskStatus } from '@/types/lab'

interface TaskDrawerProps {
  taskId: string | null
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeName?: string
  dueDate?: string
  projectName?: string
  onClose: () => void
  onStatusChange?: (id: string, status: TaskStatus) => void
  onDelete?: (id: string) => void
}

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function TaskDrawer({
  taskId,
  title,
  description,
  status,
  priority,
  assigneeName,
  dueDate,
  projectName,
  onClose,
  onStatusChange,
  onDelete,
}: TaskDrawerProps) {
  const [localStatus, setLocalStatus] = useState(status)
  const [localPriority, setLocalPriority] = useState(priority)
  const [saving, setSaving] = useState(false)

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!taskId) return
    setSaving(true)
    setLocalStatus(newStatus)
    await updateTask(taskId, { status: newStatus as 'todo' | 'in_progress' | 'review' | 'done' })
    onStatusChange?.(taskId, newStatus)
    setSaving(false)
  }

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!taskId) return
    setSaving(true)
    setLocalPriority(newPriority)
    await updateTask(taskId, { priority: newPriority as 'low' | 'medium' | 'high' | 'urgent' })
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {taskId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <StatusBadge status={localStatus} entityType="task" />
                <span className={cn(
                  'text-[10px] font-mono uppercase px-1.5 py-0.5 border rounded-sm',
                  localPriority === 'urgent' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' :
                  localPriority === 'high' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                  localPriority === 'medium' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
                  'text-white/40 border-white/10 bg-white/5'
                )}>
                  {localPriority}
                </span>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 transition-colors">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-lg font-bold text-foreground font-sans">{title}</h2>
                {projectName && (
                  <p className="text-xs text-white/40 font-mono mt-1">{projectName}</p>
                )}
              </div>

              {/* Quick Edit */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Quick Edit</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/30 uppercase mb-1 block">Status</label>
                    <select
                      value={localStatus}
                      onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                      disabled={saving}
                      className="w-full bg-white/5 border border-white/10 text-xs text-white font-mono px-2 py-1.5 focus:border-accent focus:outline-none"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-white/30 uppercase mb-1 block">Priority</label>
                    <select
                      value={localPriority}
                      onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                      disabled={saving}
                      className="w-full bg-white/5 border border-white/10 text-xs text-white font-mono px-2 py-1.5 focus:border-accent focus:outline-none"
                    >
                      {priorityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {dueDate && (
                  <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}

                {assigneeName && (
                  <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                    <User className="w-3 h-3" />
                    Assigned to: {assigneeName}
                  </div>
                )}
              </div>

              {/* Description */}
              {description && (
                <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Description</h3>
                  <p className="text-sm text-white/60 font-sans whitespace-pre-wrap">{description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-white/5">
                {onDelete && (
                  <button
                    onClick={() => onDelete(taskId)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors font-mono"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Task
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
