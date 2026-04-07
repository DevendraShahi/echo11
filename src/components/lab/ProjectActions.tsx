'use client'

import { useState } from 'react'
import { MoreHorizontal, Copy, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectActionsProps {
  projectId: string
  projectStatus: string
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function ProjectActions({ projectId, projectStatus, onDuplicate, onArchive, onDelete }: ProjectActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-[#0a0a0a] border border-white/10 z-50 shadow-xl">
            <div className="py-1">
              <button
                onClick={() => { onDuplicate?.(); setIsOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors font-mono"
              >
                <Copy className="w-4 h-4" />
                Duplicate Project
              </button>
              {projectStatus !== 'archived' && (
                <button
                  onClick={() => { onArchive?.(); setIsOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors font-mono"
                >
                  <Archive className="w-4 h-4" />
                  Archive Project
                </button>
              )}
              <button
                onClick={() => { if (confirm('Delete this project? This cannot be undone.')) { onDelete?.(); setIsOpen(false) } }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-mono"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
