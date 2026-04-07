'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderKanban, CheckSquare, Receipt, FileText, Users, ArrowRight, X } from 'lucide-react'

const WELCOME_KEY = 'echo11_welcome_seen'

const features = [
  { icon: FolderKanban, label: 'Projects', description: 'Track client work end-to-end' },
  { icon: CheckSquare, label: 'Tasks', description: 'Kanban board for your team' },
  { icon: Receipt, label: 'Invoices', description: 'Bill clients with PDF exports' },
  { icon: FileText, label: 'Contracts', description: 'Manage agreements and signing' },
  { icon: Users, label: 'Teams', description: 'Organize people and access' },
]

interface WelcomeModalProps {
  onDismiss?: () => void
}

export function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem(WELCOME_KEY)
    if (!seen) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, 'true')
    setVisible(false)
    onDismiss?.()
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 shadow-2xl"
          >
            {/* Accent bar */}
            <div className="h-px bg-accent w-full" style={{ boxShadow: '0 0 12px var(--accent-glow)' }} />

            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {/* Logo + header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 bg-accent flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
                >
                  <span className="text-black font-bold text-sm font-mono">e11</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-sans leading-tight">Welcome to echo11Lab</h2>
                  <p className="text-white/40 text-sm font-mono">Your agency operations hub</p>
                </div>
              </div>

              <p className="text-white/60 text-sm font-sans leading-relaxed mb-6">
                Manage projects, clients, invoices, and your team from one place. We&apos;ll guide you through each section as you explore.
              </p>

              {/* Feature grid */}
              <div className="grid grid-cols-1 gap-2 mb-8">
                {features.map(({ icon: Icon, label, description }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.03] border border-white/5">
                    <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-sm font-medium text-white font-sans">{label}</span>
                      <span className="text-xs text-white/40 font-mono truncate">{description}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={dismiss}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:opacity-90 text-black font-mono font-medium uppercase tracking-wider text-sm transition-opacity"
                >
                  Start exploring
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={dismiss}
                  className="px-4 py-2.5 text-white/40 hover:text-white font-mono text-sm transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
