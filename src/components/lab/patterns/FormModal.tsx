'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode } from 'react'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormModal({ isOpen, onClose, title, description, children, className }: FormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-black border border-white/10 z-50 max-h-[80vh] overflow-y-auto',
              className
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-sm font-semibold text-foreground font-sans">{title}</h2>
                {description && (
                  <p className="text-xs text-white/40 font-mono mt-0.5">{description}</p>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 transition-colors">
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
