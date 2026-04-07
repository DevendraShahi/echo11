import { KanbanBoard } from '@/components/lab/KanbanBoard'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { tasksTourSteps } from '@/components/onboarding/pageTours'

export default function TasksPage() {
  return (
    <>
      <TooltipTour steps={tasksTourSteps} pageId="tasks" />
      <PageVisitTracker pageId="tasks" />
      <div className="h-full">
        <KanbanBoard />
      </div>
    </>
  )
}
