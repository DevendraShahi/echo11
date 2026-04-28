'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, HelpCircle, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import { CommandPalette } from './CommandPalette'
import { HelpModal } from '@/components/onboarding'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'

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

interface LabHeaderProps {
  initialUnreadClientMessagesCount?: number
}

export function LabHeader({ initialUnreadClientMessagesCount = 0 }: LabHeaderProps) {
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [unreadClientMessagesCount, setUnreadClientMessagesCount] = useState(initialUnreadClientMessagesCount)
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const pageId = getPageId(pathname)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          full_name: user.user_metadata?.full_name as string || user.email?.split('@')[0]
        })
      }
    }
    getUser()
  }, [supabase])

  const loadUnreadClientMessagesCount = useCallback(async () => {
    const count = await getTeamUnreadClientMessagesCount()
    setUnreadClientMessagesCount(count)
  }, [])

  useEffect(() => {
    void loadUnreadClientMessagesCount()

    const channel = supabase
      .channel('lab-header-client-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_messages' }, () => {
        void loadUnreadClientMessagesCount()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadUnreadClientMessagesCount, supabase])

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

        <Link
          href={unreadClientMessagesCount > 0 ? '/lab/clients?filter=needs_reply' : '/lab/clients'}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded text-sm font-sans"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden md:inline">Client Messages</span>
          {unreadClientMessagesCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent">
              {unreadClientMessagesCount}
            </span>
          )}
        </Link>
        
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
