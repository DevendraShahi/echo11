'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type FeedbackTone = 'info' | 'success' | 'error'
type ConfirmTone = 'default' | 'danger'

type FeedbackItem = {
  id: number
  message: string
  tone: FeedbackTone
}

interface ConfirmOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
}

type ConfirmItem = {
  id: number
  message: string
  title: string
  confirmLabel: string
  cancelLabel: string
  tone: ConfirmTone
  resolve: (accepted: boolean) => void
}

interface AppFeedbackContextValue {
  notify: (message: string, tone?: FeedbackTone) => void
  confirmAction: (message: string, options?: ConfirmOptions) => Promise<boolean>
}

const AppFeedbackContext = createContext<AppFeedbackContextValue | null>(null)

function normalizeMessage(message: unknown): string {
  if (typeof message === 'string') {
    const trimmed = message.trim()
    return trimmed.length > 0 ? trimmed : 'Notice'
  }

  if (message === null || message === undefined) {
    return 'Notice'
  }

  return String(message)
}

export function AppFeedbackProvider({ children }: { children: React.ReactNode }) {
  const idRef = useRef(0)
  const [queue, setQueue] = useState<FeedbackItem[]>([])
  const [active, setActive] = useState<FeedbackItem | null>(null)
  const [confirmQueue, setConfirmQueue] = useState<ConfirmItem[]>([])
  const [activeConfirm, setActiveConfirm] = useState<ConfirmItem | null>(null)

  const notify = useCallback((rawMessage: string, tone: FeedbackTone = 'error') => {
    const message = normalizeMessage(rawMessage)
    idRef.current += 1
    setQueue((prev) => [...prev, { id: idRef.current, message, tone }])
  }, [])

  useEffect(() => {
    if (active || queue.length === 0) return
    const [next, ...rest] = queue
    setActive(next)
    setQueue(rest)
  }, [active, queue])

  useEffect(() => {
    if (activeConfirm || confirmQueue.length === 0) return
    const [next, ...rest] = confirmQueue
    setActiveConfirm(next)
    setConfirmQueue(rest)
  }, [activeConfirm, confirmQueue])

  useEffect(() => {
    const nativeAlert = window.alert

    window.alert = (message?: unknown) => {
      notify(normalizeMessage(message), 'error')
    }

    return () => {
      window.alert = nativeAlert
    }
  }, [notify])

  const dismiss = useCallback(() => {
    setActive(null)
  }, [])

  const confirmAction = useCallback((rawMessage: string, options?: ConfirmOptions) => {
    const message = normalizeMessage(rawMessage)
    return new Promise<boolean>((resolve) => {
      idRef.current += 1
      setConfirmQueue((prev) => [
        ...prev,
        {
          id: idRef.current,
          message,
          title: options?.title || 'Please Confirm',
          confirmLabel: options?.confirmLabel || 'Confirm',
          cancelLabel: options?.cancelLabel || 'Cancel',
          tone: options?.tone || 'default',
          resolve,
        },
      ])
    })
  }, [])

  const resolveConfirm = useCallback((accepted: boolean) => {
    setActiveConfirm((current) => {
      if (current) {
        current.resolve(accepted)
      }
      return null
    })
  }, [])

  useEffect(() => {
    if (!activeConfirm) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        resolveConfirm(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeConfirm, resolveConfirm])

  const value = useMemo<AppFeedbackContextValue>(() => ({ notify, confirmAction }), [confirmAction, notify])

  const toneIcon = active?.tone === 'success'
    ? <CheckCircle2 className="w-4 h-4 text-accent" />
    : active?.tone === 'info'
      ? <Info className="w-4 h-4 text-accent" />
      : <AlertCircle className="w-4 h-4 text-accent" />

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}
      {active && (
        <div className="fixed inset-0 z-[120] flex items-end justify-end p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md border border-accent/30 bg-black">
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5">{toneIcon}</div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">Notice</p>
                <p className="mt-1 text-sm text-white font-sans whitespace-pre-wrap">{active.message}</p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="px-3 py-1.5 border border-white/10 text-xs uppercase tracking-wider text-white/70 hover:text-white hover:border-accent/30 transition-colors font-mono"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {activeConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close confirmation"
            onClick={() => resolveConfirm(false)}
            className="absolute inset-0 bg-black/80"
          />
          <div className="relative w-full max-w-md border border-accent/30 bg-black">
            <div className="p-5 border-b border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">{activeConfirm.title}</p>
              <p className="mt-3 text-sm text-white font-sans whitespace-pre-wrap">{activeConfirm.message}</p>
            </div>
            <div className="p-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="px-3 py-1.5 border border-white/10 text-xs uppercase tracking-wider text-white/70 hover:text-white hover:border-accent/30 transition-colors font-mono"
              >
                {activeConfirm.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => resolveConfirm(true)}
                className={
                  activeConfirm.tone === 'danger'
                    ? 'px-3 py-1.5 border border-red-500/40 bg-red-500/15 text-xs uppercase tracking-wider text-red-200 hover:bg-red-500/25 transition-colors font-mono'
                    : 'px-3 py-1.5 border border-accent/40 bg-accent/15 text-xs uppercase tracking-wider text-accent hover:bg-accent/25 transition-colors font-mono'
                }
              >
                {activeConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppFeedbackContext.Provider>
  )
}

export function useAppFeedback(): AppFeedbackContextValue {
  const context = useContext(AppFeedbackContext)
  if (!context) {
    throw new Error('useAppFeedback must be used within AppFeedbackProvider')
  }

  return context
}
