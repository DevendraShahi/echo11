'use client'

import { useState } from 'react'
import { toggleTaskStatus } from '@/lib/actions/project-actions'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'

interface ToggleTaskButtonProps {
  taskId: string
  completed: boolean
}

export function ToggleTaskButton({ taskId, completed }: ToggleTaskButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await toggleTaskStatus(taskId, !completed)
      
      if (!result.success) {
        setError(result.error || 'Failed to update task')
        setLoading(false)
        return
      }
      
      router.refresh()
    } catch (err) {
      console.error('Error toggling task:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={clsx(
          'w-5 h-5 rounded-lg border flex items-center justify-center transition-all',
          completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-white/30 hover:border-accent',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin text-white/50" />
        ) : completed ? (
          <Check className="w-3 h-3 text-black" />
        ) : null}
      </button>
      
      {error && (
        <div className="absolute left-6 top-0 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400 whitespace-nowrap">{error}</span>
        </div>
      )}
    </div>
  )
}