'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, ExternalLink, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTopic {
  id: string
  title: string
  content: string
  icon?: string
}

interface PageHelp {
  title: string
  topics: HelpTopic[]
  quickActions?: { label: string; href: string }[]
}

const helpContent: Record<string, PageHelp> = {
  dashboard: {
    title: 'Dashboard Help',
    topics: [
      { id: 'stats', title: 'Understanding Stats Cards', content: 'The four stat cards show key metrics: Active Projects, Tasks Completed, Revenue, and Upcoming Meetings.' },
      { id: 'charts', title: 'Charts & Graphs', content: 'Revenue chart shows 6-month trends. Project status chart displays distribution by status.' },
      { id: 'activity', title: 'Activity Feed', content: 'See recent actions across the platform. Shows who did what and when.' },
      { id: 'quick-actions', title: 'Quick Actions', content: 'Shortcut buttons to create new projects, tasks, meetings, or invoices.' }
    ],
    quickActions: [
      { label: 'Create Project', href: '/lab/projects/new' },
      { label: 'Create Task', href: '/lab/tasks/new' }
    ]
  },
  projects: {
    title: 'Projects Help',
    topics: [
      { id: 'create', title: 'Creating a Project', content: 'Click "New Project" to create. Required: Project name. Optional: Client, description, dates, budget.' },
      { id: 'views', title: 'Grid vs List View', content: 'Toggle between card-based grid view and table-based list view.' },
      { id: 'filters', title: 'Filtering Projects', content: 'Use status tabs: All, Active, On Hold, Completed, Archived.' },
      { id: 'milestones', title: 'Using Milestones', content: 'Milestones help track project progress. Each milestone has a weight.' }
    ],
    quickActions: [{ label: 'Create Project', href: '/lab/projects/new' }]
  },
  tasks: {
    title: 'Tasks Help',
    topics: [
      { id: 'kanban', title: 'Kanban Board', content: 'Four columns: To Do, In Progress, Review, Done. Drag and drop to change status.' },
      { id: 'create', title: 'Creating Tasks', content: 'Click "New Task". Required: Title, Project. Optional: Priority, Assignee, Due Date.' },
      { id: 'priority', title: 'Priority Levels', content: 'Four levels: Low, Medium, High, Urgent. Urgent tasks are highlighted.' },
      { id: 'due-dates', title: 'Due Dates', content: 'Tasks past due date show in red.' }
    ],
    quickActions: [{ label: 'Create Task', href: '/lab/tasks/new' }]
  },
  meetings: {
    title: 'Meetings Help',
    topics: [
      { id: 'create', title: 'Scheduling Meetings', content: 'Click "New Meeting". Required: Title. Optional: Project, Date/Time, Duration, Video Link.' },
      { id: 'video', title: 'Video Calls', content: 'Add a video link (Zoom, Google Meet) when creating.' },
      { id: 'filters', title: 'View Filters', content: 'Switch between Upcoming, Past, or All meetings.' }
    ],
    quickActions: [{ label: 'Schedule Meeting', href: '/lab/meetings/new' }]
  },
  invoices: {
    title: 'Invoices Help',
    topics: [
      { id: 'create', title: 'Creating Invoices', content: 'Click "New Invoice". Required: Client. Add line items with description, quantity, rate.' },
      { id: 'status', title: 'Invoice Status', content: 'Status flow: Draft → Sent → Paid.' },
      { id: 'pdf', title: 'PDF Export', content: 'Download any invoice as a professional PDF.' }
    ],
    quickActions: [{ label: 'Create Invoice', href: '/lab/invoices/new' }]
  },
  contracts: {
    title: 'Contracts Help',
    topics: [
      { id: 'create', title: 'Creating Contracts', content: 'Click "New Contract". Required: Title, Client. Optional: Number, Value, Dates, File.' },
      { id: 'status', title: 'Contract Status', content: 'Statuses: Draft, Pending, Signed, Expired, Terminated.' },
      { id: 'files', title: 'File Management', content: 'Upload contract documents. Download from detail page.' }
    ]
  },
  clients: {
    title: 'Clients Help',
    topics: [
      { id: 'create', title: 'Adding Clients', content: 'Click "Add Client". Required: Company Name. Optional: Contact info, Industry, Tags.' },
      { id: 'portal', title: 'Client Portal', content: 'Invite clients to view their projects and invoices.' },
      { id: 'lifecycle', title: 'Client Lifecycle', content: 'Track: Lead → Prospect → Active → At Risk → Inactive.' }
    ],
    quickActions: [{ label: 'Add Client', href: '/lab/clients/new' }]
  },
  teams: {
    title: 'Teams Help',
    topics: [
      { id: 'create', title: 'Creating Teams', content: 'Click "New Team" (admin only). Required: Name. Optional: Description, Color, Lead.' },
      { id: 'access', title: 'Access Control', content: 'Admins see all teams. Team Leads see their team only.' },
      { id: 'lead', title: 'Team Lead', content: 'Each team can have a lead who manages members and projects.' }
    ]
  },
  settings: {
    title: 'Settings Help',
    topics: [
      { id: 'profile', title: 'Profile Management', content: 'Update your name, avatar, and preferences.' },
      { id: 'notifications', title: 'Notifications', content: 'Toggle: Email notifications, Task reminders, Meeting reminders.' },
      { id: 'theme', title: 'Appearance', content: 'Choose theme: Dark, Light, or System.' },
      { id: 'admin', title: 'Admin Features', content: 'If admin: Invite team members, Assign users to teams.' }
    ]
  }
}

interface HelpModalProps {
  pageId: string
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ pageId, isOpen, onClose }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  const pageHelp = helpContent[pageId]
  const allTopics = pageHelp?.topics || []

  const filteredTopics = searchQuery
    ? allTopics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTopics

  useEffect(() => {
    let container = document.getElementById('help-modal-portal')
    if (!container) {
      container = document.createElement('div')
      container.id = 'help-modal-portal'
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;'
      document.body.appendChild(container)
    }
    setPortalContainer(container)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedTopic(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!pageHelp || !portalContainer) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-black border border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-white font-sans">{pageHelp.title}</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              <div className="w-1/3 border-r border-white/5 p-4 overflow-y-auto">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search help..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  {filteredTopics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded text-sm transition-colors font-sans',
                        selectedTopic === topic.id ? 'bg-accent/10 text-accent' : 'text-white/60 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {selectedTopic ? (
                  <div>
                    <button onClick={() => setSelectedTopic(null)} className="text-sm text-accent hover:text-accent/80 mb-4 font-sans focus:outline-none">
                      ← Back to all topics
                    </button>
                    {(() => {
                      const topic = allTopics.find(t => t.id === selectedTopic)
                      return topic ? (
                        <div className="space-y-4">
                          <h3 className="text-base font-semibold text-white font-sans">{topic.title}</h3>
                          <p className="text-white/60 text-sm leading-relaxed font-sans">{topic.content}</p>
                        </div>
                      ) : null
                    })()}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-semibold text-white mb-3 font-sans">Getting Started</h3>
                    <p className="text-white/60 text-sm mb-6 font-sans">Select a topic from the left to learn more about this page.</p>
                    {pageHelp.quickActions && pageHelp.quickActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-white/80 mb-3 font-sans">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          {pageHelp.quickActions.map(action => (
                            <a
                              key={action.href}
                              href={action.href}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors font-sans"
                            >
                              {action.label}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/5">
              <a href="/lab/docs" target="_blank" className="text-sm text-white/40 hover:text-white transition-colors font-sans">
                View Full Documentation →
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalContainer
  )
}

interface HelpButtonProps {
  pageId: string
  className?: string
}

export function HelpButton({ pageId, className }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded text-sm font-sans',
          className
        )}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Help</span>
      </button>
      <HelpModal pageId={pageId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
