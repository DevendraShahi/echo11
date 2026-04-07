'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { User, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import { CommandPalette } from './CommandPalette'
import { HelpModal } from '@/components/onboarding'

const pageIdMap: Record<string, string> = {
  '/lab/dashboard': 'dashboard',
  '/lab/projects': 'projects',
  '/lab/projects/new': 'projects',
  '/lab/tasks': 'tasks',
  '/lab/tasks/new': 'tasks',
  '/lab/meetings': 'meetings',
  '/lab/meetings/new': 'meetings',
  '/lab/invoices': 'invoices',
  '/lab/invoices/new': 'invoices',
  '/lab/contracts': 'contracts',
  '/lab/clients': 'clients',
  '/lab/teams': 'teams',
  '/lab/settings': 'settings',
}

function getPageId(pathname: string): string {
  for (const [path, id] of Object.entries(pageIdMap)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return id
    }
  }
  return 'dashboard'
}

export function LabHeader() {
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const pathname = usePathname()
  const pageId = getPageId(pathname)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          full_name: user.user_metadata?.full_name as string || user.email?.split('@')[0]
        })
      }
    }
    getUser()
  }, [])

  return (
    <header className="h-16 bg-black/30 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 font-sans sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setHelpOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded text-sm font-sans"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </button>
        
        <NotificationBell />

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="w-8 h-8 bg-white/10 border border-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white/70" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground font-sans">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-white/50 font-mono">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <HelpModal pageId={pageId} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  )
}
