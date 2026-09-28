'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExternalLink, Loader2, Lock } from 'lucide-react'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'
import { LabButton } from '@/components/ui/LabButton'
import { updateTaskStatus } from '@/lib/actions/task-actions'
import { Task, TaskStatus } from '@/types/lab'

interface ProjectTaskStreamProps {
  tasks: Task[]
  canManage: boolean
  userId: string | null
}

interface StreamTaskRow {
  id: string
  title: string
  due_date: string | null
  assignee_id: string | null
  status: TaskStatus
}

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'No due date'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No due date'
  const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
  return `Due ${label}`
}

function getTaskUpdateError(message?: string): string {
  if (!message) return 'Task update failed'
  const lowered = message.toLowerCase()

  if (
    lowered.includes('cannot update this task') ||
    lowered.includes('you can only update tasks assigned to you') ||
    lowered.includes('forbidden')
  ) {
    return 'You cannot update this task'
  }

  return message
}

export function ProjectTaskStream({ tasks, canManage, userId }: ProjectTaskStreamProps) {
  const [rows, setRows] = useState<StreamTaskRow[]>(
    tasks.map((task) => ({
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      assignee_id: task.assignee_id,
      status: task.status,
    }))
  )
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
  const { notify } = useAppFeedback()
  const router = useRouter()

  const canEditTask = (task: StreamTaskRow) => canManage || Boolean(userId && task.assignee_id === userId)

  async function handleStatusChange(task: StreamTaskRow, nextStatus: TaskStatus) {
    if (savingTaskId) return

    if (!canEditTask(task)) {
      notify('You cannot update this task', 'error')
      return
    }

    if (task.status === nextStatus) {
      return
    }

    const previousStatus = task.status
    setSavingTaskId(task.id)
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === task.id ? { ...row, status: nextStatus } : row))
    )

    const result = await updateTaskStatus(task.id, nextStatus)
    if (!result.success) {
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === task.id ? { ...row, status: previousStatus } : row))
      )
      notify(getTaskUpdateError(result.error), 'error')
      setSavingTaskId(null)
      return
    }

    notify('Task updated', 'success')
    router.refresh()
    setSavingTaskId(null)
  }

  return (
    <div className="space-y-px border border-white/10 bg-white/5">
      {rows.map((task) => {
        const canEdit = canEditTask(task)
        const isSaving = savingTaskId === task.id

        return (
          <article
            key={task.id}
            className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto_auto] md:items-center"
          >
            <div>
              <p className="text-sm text-foreground font-sans">{task.title}</p>
              <p className="mt-1 text-[11px] text-white/45 font-mono">
                {formatDateLabel(task.due_date)}
              </p>
            </div>

            <div className="justify-self-start md:justify-self-center">
              <div className="relative min-w-[150px]">
                <select
                  value={task.status}
                  onChange={(event) => handleStatusChange(task, event.target.value as TaskStatus)}
                  disabled={!canEdit || isSaving}
                  className="w-full appearance-none border border-white/15 bg-[#040b12] px-3 py-2 pr-9 text-[10px] uppercase tracking-[0.13em] text-white/80 font-mono focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  ) : !canEdit ? (
                    <Lock className="h-3.5 w-3.5 text-white/45" />
                  ) : null}
                </div>
              </div>
            </div>

            <Link href={`/lab/tasks/${task.id}`} className="justify-self-start md:justify-self-end">
              <LabButton variant="ghost" size="sm">
                Open
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </LabButton>
            </Link>
          </article>
        )
      })}
    </div>
  )
}
