import { notFound } from 'next/navigation'
import { CheckSquare } from 'lucide-react'
import { KanbanBoard } from '@/components/lab/KanbanBoard'
import { DataState } from '@/components/lab/primitives/DataState'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { getProjectAccess, getProjectWorkspace, getProjectTasks } from '@/features/lab/workspace/data'
import { ProjectSubpageShell } from '../ProjectSubpageShell'
import { ProjectSectionHeader } from '../ProjectSectionHeader'
import { ProjectTaskStream } from './ProjectTaskStream'

export default async function ProjectDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)

  if (!project) {
    notFound()
  }

  const access = await getProjectAccess(id, project.team_id)
  if (!access.canAccess) {
    notFound()
  }

  const tasks = await getProjectTasks(id)

  const todoCount = tasks.filter((task) => task.status === 'todo').length
  const inProgressCount = tasks.filter((task) => task.status === 'in_progress').length
  const reviewCount = tasks.filter((task) => task.status === 'review').length
  const doneCount = tasks.filter((task) => task.status === 'done').length

  return (
    <ProjectSubpageShell>
      <div className="space-y-6">
        <ProjectSectionHeader
          project={project}
          title={`${project.name} Delivery`}
          subtitle="Execution board, operating rhythm, and task stream"
          icon={CheckSquare}
        />

        <MetricStrip
          items={[
            { label: 'Total Tasks', value: tasks.length },
            { label: 'In Progress', value: inProgressCount, tone: 'warning' },
            { label: 'In Review', value: reviewCount, tone: 'accent' },
            { label: 'Done', value: doneCount, tone: 'success' },
          ]}
        />

        <PanelSection
          title="Kanban Board"
          description="Drag tasks across states. Add and filter tasks in project context."
        >
          <KanbanBoard
            defaultProjectId={id}
            embedded
            title="Project Kanban"
            description="Task movement updates delivery flow and progress in one place"
          />
        </PanelSection>

        <PanelSection
          title="Linear Task Stream"
          description="Fast scan of due work and status changes"
        >
          {tasks.length === 0 ? (
            <DataState
              title="No tasks in this project"
              description="Create tasks from the board above to start delivery execution."
              icon={CheckSquare}
            />
          ) : (
            <ProjectTaskStream tasks={tasks} canManage={access.canManage} userId={access.userId} />
          )}
        </PanelSection>

        {todoCount > 0 || inProgressCount > 0 || reviewCount > 0 ? (
          <p className="text-xs text-white/40 font-mono">
            {doneCount}/{tasks.length} tasks completed. Keep moving items from review into done to close the sprint.
          </p>
        ) : null}
      </div>
    </ProjectSubpageShell>
  )
}
