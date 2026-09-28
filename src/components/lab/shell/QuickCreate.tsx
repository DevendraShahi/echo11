'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  CheckSquare,
  UserCircle,
  Receipt,
  FileText,
  Calendar,
  StickyNote,
  MessageSquare,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickCreateProps {
  onClose: () => void
}

type CreateItem = {
  label: string
  href: string
  icon: React.ReactNode
  description: string
}

const createItems: CreateItem[] = [
  {
    label: 'Project',
    href: '/lab/projects/new',
    icon: <FolderKanban className="w-4 h-4" />,
    description: 'Create a new project',
  },
  {
    label: 'Task',
    href: '/lab/tasks',
    icon: <CheckSquare className="w-4 h-4" />,
    description: 'Add a new task',
  },
  {
    label: 'Client',
    href: '/lab/clients',
    icon: <UserCircle className="w-4 h-4" />,
    description: 'Add a new client',
  },
  {
    label: 'Invoice',
    href: '/lab/invoices/new',
    icon: <Receipt className="w-4 h-4" />,
    description: 'Create an invoice',
  },
  {
    label: 'Contract',
    href: '/lab/contracts',
    icon: <FileText className="w-4 h-4" />,
    description: 'Create a contract',
  },
  {
    label: 'Meeting',
    href: '/lab/meetings',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Schedule a meeting',
  },
  {
    label: 'Note',
    href: '/lab/clients',
    icon: <StickyNote className="w-4 h-4" />,
    description: 'Add a note',
  },
  {
    label: 'Message',
    href: '/lab/clients',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Send a client message',
  },
]

export function QuickCreate({ onClose }: QuickCreateProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = createItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const el = containerRef.current?.querySelectorAll('[data-item]')
    if (el?.[selectedIndex]) {
      el[selectedIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div
        ref={containerRef}
        className="absolute top-14 right-4 sm:right-6 w-80 bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Create New</h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-white/5">
          <input
            type="text"
            placeholder="Filter..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(i => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                window.location.href = filtered[selectedIndex].href
              }
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
            autoFocus
          />
        </div>

        {/* Items */}
        <div className="max-h-80 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-white/30 text-sm font-mono">No matches</div>
          ) : (
            filtered.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                data-item
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 p-3 transition-colors cursor-pointer',
                  index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                )}
              >
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-white/60">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-white font-sans">{item.label}</p>
                  <p className="text-xs text-white/40 font-mono">{item.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-2 border-t border-white/5 text-[10px] text-white/30 font-mono">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-white/5 rounded">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-white/5 rounded">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-white/5 rounded">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
