import { Task } from '@/types/lab'
import { ToggleTaskButton } from './ToggleTaskButton'
import { LabBadge } from '@/components/ui/LabBadge'
import { CheckSquare } from 'lucide-react'

type TaskWithRelations = Partial<Task> & {
  project?: { name: string } | null
}

interface TaskListProps {
  tasks: TaskWithRelations[]
  showProject?: boolean
}

export function TaskList({ tasks, showProject = false }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 border border-white/10 rounded-lg">
        <CheckSquare className="w-12 h-12 text-white/20 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2 font-sans">No tasks found</h3>
        <p className="text-sm text-white/50 font-sans max-w-sm">
          There are no tasks matching this view.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isDone = task.status === 'done'
        return (
          <div key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-none bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className="mt-0.5 sm:mt-0 shrink-0">
                <ToggleTaskButton taskId={task.id!} completed={isDone} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-sans truncate ${isDone ? 'text-white/40 line-through' : 'text-foreground'}`}>
                  {task.title}
                </p>
                {showProject && task.project && (
                  <p className="text-xs text-white/40 font-sans truncate mt-1">
                    {task.project.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 pl-8 sm:pl-0">
              <LabBadge 
                variant={
                  task.priority === 'urgent' ? 'danger' : 
                  task.priority === 'high' ? 'warning' : 
                  'ghost'
                } 
                className="font-sans"
              >
                {task.priority || 'medium'}
              </LabBadge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
