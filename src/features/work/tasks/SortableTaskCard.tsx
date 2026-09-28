'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Task } from '@/types/lab'
import { TaskCard } from './TaskCard'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SortableTaskCardProps {
  task: Task
  isDragging?: boolean
}

export function SortableTaskCard({ task, isDragging }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />
      <TaskCard
        id={task.id}
        title={task.title}
        description={task.description || undefined}
        status={task.status}
        priority={task.priority}
        assigneeName={task.assignee?.full_name || undefined}
        dueDate={task.due_date || undefined}
        projectName={task.project?.name || undefined}
        onClick={() => {}}
        compact
      />
      <Link
        href={`/lab/tasks/${task.id}`}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded flex-shrink-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ExternalLink className="w-3 h-3 text-white/40" />
      </Link>
    </div>
  )
}
