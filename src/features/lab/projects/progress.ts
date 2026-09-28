import { TaskPriority } from '@/types/lab'

const priorityWeightMap: Record<TaskPriority, number> = {
  low: 0.5,
  medium: 1,
  high: 2,
  urgent: 3,
}

export function calculateWeightedTaskProgress(
  tasks: Array<{ status: string; priority: string }> | null | undefined,
  fallbackProgress = 0
): number {
  if (!tasks || tasks.length === 0) {
    return fallbackProgress
  }

  const totalWeight = tasks.reduce(
    (sum, task) => sum + (priorityWeightMap[task.priority as TaskPriority] || 0),
    0
  )

  if (totalWeight === 0) {
    return fallbackProgress
  }

  const completedWeight = tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + (priorityWeightMap[task.priority as TaskPriority] || 0), 0)

  return Math.round((completedWeight / totalWeight) * 100)
}
