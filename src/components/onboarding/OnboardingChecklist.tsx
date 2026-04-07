'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, RotateCcw, HelpCircle, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bump this string to reset all users' onboarding state on their next visit.
const ONBOARDING_VERSION = 'v2'
const ONBOARDING_EVENT = 'echo11:onboarding:update'

interface OnboardingStep {
  id: string
  label: string
  description: string
  completed: boolean
}

const defaultSteps: Omit<OnboardingStep, 'completed'>[] = [
  { id: 'dashboard',  label: 'Dashboard',  description: 'Overview of projects, tasks, and revenue' },
  { id: 'projects',   label: 'Projects',   description: 'Manage client projects and milestones' },
  { id: 'tasks',      label: 'Tasks',      description: 'Kanban board for task management' },
  { id: 'meetings',   label: 'Meetings',   description: 'Schedule and track meetings' },
  { id: 'invoices',   label: 'Invoices',   description: 'Create and manage client invoices' },
  { id: 'contracts',  label: 'Contracts',  description: 'Manage client contracts' },
  { id: 'clients',    label: 'Clients',    description: 'Manage client companies and contacts' },
  { id: 'teams',      label: 'Teams',      description: 'Organize team members into teams' },
  { id: 'settings',   label: 'Settings',   description: 'Profile, preferences, and team management' },
]

interface OnboardingChecklistProps {
  onHelpClick?: () => void
  onStartTour?: (pageId: string) => void
}

export function OnboardingChecklist({ onHelpClick, onStartTour }: OnboardingChecklistProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadSteps = useCallback(() => {
    try {
      const saved = localStorage.getItem('echo11_onboarding')
      const completed: string[] = saved ? JSON.parse(saved) : []
      setSteps(defaultSteps.map(s => ({ ...s, completed: completed.includes(s.id) })))
    } catch {
      setSteps(defaultSteps.map(s => ({ ...s, completed: false })))
    }
  }, [])

  useEffect(() => {
    // Version-based reset: bump ONBOARDING_VERSION to wipe all users' state on next visit.
    try {
      const v = localStorage.getItem('echo11_onboarding_version')
      if (v !== ONBOARDING_VERSION) {
        localStorage.removeItem('echo11_onboarding')
        localStorage.removeItem('echo11_welcome_seen')
        defaultSteps.forEach(s => localStorage.removeItem(`echo11_tour_${s.id}_done`))
        localStorage.setItem('echo11_onboarding_version', ONBOARDING_VERSION)
      }
    } catch { /* ignore */ }
    loadSteps()
  }, [loadSteps])

  // Re-sync when PageVisitTracker marks a step complete on the same page.
  useEffect(() => {
    window.addEventListener(ONBOARDING_EVENT, loadSteps)
    return () => window.removeEventListener(ONBOARDING_EVENT, loadSteps)
  }, [loadSteps])

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isOpen])

  const completedCount = steps.filter(s => s.completed).length
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

  const toggleStep = (id: string) => {
    const updated = steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    setSteps(updated)
    try {
      localStorage.setItem('echo11_onboarding', JSON.stringify(updated.filter(s => s.completed).map(s => s.id)))
    } catch { /* ignore */ }
  }

  const resetOnboarding = () => {
    const cleared = steps.map(s => ({ ...s, completed: false }))
    setSteps(cleared)
    try {
      localStorage.setItem('echo11_onboarding', '[]')
      localStorage.removeItem('echo11_welcome_seen')
      defaultSteps.forEach(s => localStorage.removeItem(`echo11_tour_${s.id}_done`))
    } catch { /* ignore */ }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-3 text-sm font-medium transition-colors font-sans',
          isOpen ? 'text-white bg-white/5' : 'text-white/50 hover:text-white'
        )}
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>Onboarding</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/30">{completedCount}/{steps.length}</span>
          {isOpen
            ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
            : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
        </span>
      </button>

      {/* Panel — renders inline above trigger, no portal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-1 bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col z-50"
            style={{ maxHeight: '60vh' }}
          >
            {/* Accent bar */}
            <div className="h-px bg-accent flex-shrink-0" style={{ boxShadow: '0 0 8px var(--accent-glow)' }} />

            {/* Progress header */}
            <div className="p-3 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white font-sans">Your Progress</span>
                <span className="text-xs font-mono text-white/30">{completedCount}/{steps.length}</span>
              </div>
              <div className="h-1 bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {steps.map(step => (
                <div key={step.id} className="group flex items-center border-b border-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      'flex-1 flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors',
                      step.completed
                        ? 'text-white/25 bg-transparent'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    )}
                  >
                    {step.completed
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      : <Circle className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-xs font-medium font-sans', step.completed && 'line-through')}>
                        {step.label}
                      </div>
                      <div className="text-[10px] text-white/25 font-mono truncate mt-0.5">
                        {step.description}
                      </div>
                    </div>
                  </button>
                  {onStartTour && !step.completed && (
                    <button
                      type="button"
                      onClick={() => onStartTour(step.id)}
                      title="Take tour"
                      className="opacity-0 group-hover:opacity-100 pr-2.5 text-white/30 hover:text-accent transition-all flex-shrink-0"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/5 flex-shrink-0">
              <button
                type="button"
                onClick={resetOnboarding}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              {onHelpClick && (
                <button
                  type="button"
                  onClick={onHelpClick}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors font-mono"
                >
                  <HelpCircle className="w-3 h-3" />
                  Help
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function markStepComplete(stepId: string) {
  try {
    const saved = localStorage.getItem('echo11_onboarding')
    const completed: string[] = saved ? JSON.parse(saved) : []
    if (!completed.includes(stepId)) {
      completed.push(stepId)
      localStorage.setItem('echo11_onboarding', JSON.stringify(completed))
      window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT))
    }
  } catch { /* SSR guard */ }
}

export function isStepComplete(stepId: string): boolean {
  try {
    const saved = localStorage.getItem('echo11_onboarding')
    const completed: string[] = saved ? JSON.parse(saved) : []
    return completed.includes(stepId)
  } catch {
    return false
  }
}

export function getOnboardingProgress(): { completed: number; total: number } {
  try {
    const saved = localStorage.getItem('echo11_onboarding')
    const completed: string[] = saved ? JSON.parse(saved) : []
    return { completed: completed.length, total: defaultSteps.length }
  } catch {
    return { completed: 0, total: defaultSteps.length }
  }
}
