'use client'

import { useEffect, useState } from 'react'
import { toggleTaskStatus } from '@/lib/actions/project-actions'
import { Check, Loader2, Lock } from 'lucide-react'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

interface ToggleTaskButtonProps {
  taskId: string
  completed: boolean
  canToggle?: boolean
  disabledMessage?: string
}

function getFriendlyError(message?: string) {
  if (!message) return 'Failed to update task'
  const lowered = message.toLowerCase()
  if (
    lowered.includes('cannot update this task') ||
    lowered.includes('you can only update tasks assigned to you') ||
    lowered.includes('not authorized')
  ) {
    return 'You cannot update this task'
  }
  return message
}

export function ToggleTaskButton({
  taskId,
  completed,
  canToggle = true,
  disabledMessage = 'You cannot update this task',
}: ToggleTaskButtonProps) {
  const [loading, setLoading] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(completed)
  const { notify } = useAppFeedback()
  const router = useRouter()

  useEffect(() => {
    setLocalCompleted(completed)
  }, [completed])

  const handleToggle = async () => {
    if (!canToggle) {
      notify(disabledMessage, 'error')
      return
    }

    const nextCompleted = !localCompleted
    setLocalCompleted(nextCompleted)
    setLoading(true)
    
    try {
      const result = await toggleTaskStatus(taskId, nextCompleted)
      
      if (!result.success) {
        setLocalCompleted(!nextCompleted)
        notify(getFriendlyError(result.error), 'error')
        setLoading(false)
        return
      }
      
      router.refresh()
    } catch (err) {
      setLocalCompleted(!nextCompleted)
      console.error('Error toggling task:', err)
      notify('An unexpected error occurred while updating the task', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" title={!canToggle ? disabledMessage : undefined}>
      <button
        onClick={handleToggle}
        disabled={loading || !canToggle}
        className={clsx(
          'w-5 h-5 rounded-lg border flex items-center justify-center transition-all',
          localCompleted
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/30 hover:border-accent',
          !canToggle && 'border-white/15 bg-white/[0.03] hover:border-white/15',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-white/50" />
        ) : !canToggle ? (
          <Lock className="w-3 h-3 text-white/35" />
        ) : localCompleted ? (
          <Check className="w-3 h-3 text-black" />
        ) : null}
      </button>
    </div>
  )
}
