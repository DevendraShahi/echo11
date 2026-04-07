'use client'

import { useEffect } from 'react'
import { markStepComplete } from './OnboardingChecklist'

interface PageVisitTrackerProps {
  pageId: string
}

export function PageVisitTracker({ pageId }: PageVisitTrackerProps) {
  useEffect(() => {
    markStepComplete(pageId)
  }, [pageId])
  return null
}
