'use client'

import { useState } from 'react'
import { MilestoneList } from '@/components/lab/MilestoneList'
import { Milestone } from '@/types/lab'

interface MilestonesPageClientProps {
  projectId: string
  initialMilestones: Milestone[]
}

export function MilestonesPageClient({ projectId, initialMilestones }: MilestonesPageClientProps) {
  const [milestones, setMilestones] = useState(initialMilestones)

  return (
    <MilestoneList
      projectId={projectId}
      milestones={milestones}
      onMilestonesChange={setMilestones}
    />
  )
}
