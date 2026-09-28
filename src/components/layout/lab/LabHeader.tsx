'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HelpCircle, Menu, MessageSquare, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'
import { CommandPalette } from './CommandPalette'
import { HelpModal } from '@/components/onboarding/HelpModal'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'
import { useLabNavigation } from './LabNavigationContext'

function getPageId(pathname: string): string {
  if (pathname.startsWith('/lab/command')) return 'command'
  if (pathname.startsWith('/lab/projects')) return 'projects'
  if (pathname.startsWith('/lab/clients')) return 'clients'
  if (pathname.startsWith('/lab/messages')) return 'messages'
  if (pathname.startsWith('/lab/settings')) return 'settings'
  return 'command'
}

interface LabHeaderProps {
  initialUnreadClientMessagesCount?: number
}

export function LabHeader({ initialUnreadClientMessagesCount = 0 }: LabHeaderProps) {
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [unreadClientMessagesCount, setUnreadClientMessagesCount] = useState(initialUnreadClientMessagesCount)
  const { toggleSidebar } = useLabNavigation()
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const pageId = getPageId(pathname)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return
      setUser({
        email: authUser.email || '',
        full_name: (authUser.user_metadata?.full_name as string | undefined) || authUser.email?.split('@')[0],
      })
    }

    void loadUser()
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
    <header className="h-16 border-b border-white/10 bg-black/70 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-white/5 text-white/70 transition-colors hover:text-white hover:border-white/25 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        <CommandPalette />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setHelpOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.13em] font-mono text-white/60 transition-colors hover:text-white hover:border-white/25"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Help
        </button>

        <Link
          href="/lab/messages"
          className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-2.5 py-2 sm:px-3 text-[11px] uppercase tracking-[0.13em] font-mono text-white/60 transition-colors hover:text-white hover:border-white/25"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Messages</span>
          {unreadClientMessagesCount > 0 ? (
            <span className="border border-amber-400/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">{unreadClientMessagesCount}</span>
          ) : null}
        </Link>

        <NotificationBell />

        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <div className="h-8 w-8 border border-white/15 bg-white/5 flex items-center justify-center">
            <User className="h-4 w-4 text-white/65" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-foreground font-sans">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-white/45 font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      <HelpModal pageId={pageId} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  )
}
