'use client'

import { useState, useCallback, useEffect } from 'react'
import { Joyride, Step, ACTIONS, EVENTS, STATUS } from 'react-joyride'
import { cn } from '@/lib/utils'
import { consumePendingTour } from './tourState'

export interface TourStep {
  target: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  disableBeacon?: boolean
}

interface TooltipTourProps {
  steps: TourStep[]
  pageId: string
  onComplete?: () => void
}

export function TooltipTour({ steps, pageId, onComplete }: TooltipTourProps) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const storageKey = `echo11_tour_${pageId}_done`
    const hasSeenTour = localStorage.getItem(storageKey)
    const isPending = consumePendingTour(pageId)

    if ((!hasSeenTour || isPending) && steps.length > 0) {
      // Small delay so page elements have time to render
      const t = setTimeout(() => setRun(true), 300)
      return () => clearTimeout(t)
    }
  }, [pageId, steps.length])

  const handleJoyrideCallback = useCallback((data: any) => {
    const { status, type, step } = data

    // Manually scroll into view for nested scroll containers
    if (type === EVENTS.STEP_BEFORE && step?.target) {
      setTimeout(() => {
        const targetElement = document.querySelector(step.target)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 0)
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(`echo11_tour_${pageId}_done`, 'true')
      setRun(false)
      onComplete?.()
    }
  }, [pageId, onComplete])

  const joyrideSteps: Step[] = steps.map(step => ({
    target: step.target,
    title: step.title,
    content: step.content,
    placement: step.position || 'bottom',
    disableBeacon: step.disableBeacon ?? false,
  }))

  const TooltipComponent = ({
    continuous,
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
  }: any) => (
    <div
      {...tooltipProps}
      className="bg-[#0a0a0a] border border-white/10 shadow-2xl p-5 max-w-[320px] font-sans relative"
    >
      <div
        className="h-px mb-4 bg-accent"
        style={{ boxShadow: '0 0 8px var(--accent-glow)' }}
      />
      {step.title && (
        <h3 className="text-white font-semibold mb-2 text-sm font-sans pr-6">
          {step.title}
        </h3>
      )}
      <div className="text-white/60 text-sm font-sans leading-relaxed mb-4">
        {step.content}
      </div>
      <div className="flex items-center justify-between">
        <button
          {...skipProps}
          className="text-white/30 hover:text-white/60 transition-colors text-xs font-mono"
        >
          Skip tour
        </button>
        <div className="flex gap-2 items-center">
          {index > 0 && (
            <button
              {...backProps}
              className="text-white/50 hover:text-white transition-colors text-xs font-mono px-2"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            className="bg-accent text-black font-medium px-3 py-1.5 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            {continuous && !isLastStep ? 'Next' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <Joyride
      steps={joyrideSteps}
      run={run}
      continuous
      showSkipButton
      disableScrolling={true}
      floaterProps={{ disableAnimation: true }}
      spotlightClicks={true}
      callback={handleJoyrideCallback}
      tooltipComponent={TooltipComponent}
      styles={{
        // @ts-expect-error react-joyride v3 types
        options: {
          arrowColor: '#0a0a0a',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9999,
          primaryColor: '#FFFFFF',
        },
        beaconInner: {
          backgroundColor: '#FFFFFF',
        },
        beaconOuter: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: '#FFFFFF',
        }
      }}
    />
  )
}

interface StartTourButtonProps {
  pageId: string
  onClick?: () => void
}

export function StartTourButton({ pageId, onClick }: StartTourButtonProps) {
  const handleClick = () => {
    localStorage.removeItem(`echo11_tour_${pageId}_done`)
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10',
        'text-white/60 hover:text-white hover:bg-white/10',
        'transition-colors text-xs font-mono uppercase tracking-wider'
      )}
    >
      Take Tour
    </button>
  )
}
