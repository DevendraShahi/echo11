'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, Plus, User } from 'lucide-react'
import { CommandPalette } from '@/components/layout/lab/CommandPalette'
import { NotificationBell } from '@/components/layout/lab/NotificationBell'
import { QuickCreate } from './QuickCreate'
import { useSidebarContext } from './LabShell'

interface LabTopbarProps {
  userName?: string
  userEmail?: string
  userRole?: string
}

export function LabTopbar({ userName, userEmail, userRole }: LabTopbarProps) {
  const { toggle, sidebarOpen } = useSidebarContext()
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null)
  const [showQuickCreate, setShowQuickCreate] = useState(false)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          full_name: user.user_metadata?.full_name as string || user.email?.split('@')[0],
        })
      }
    }
    getUser()
  }, [])

  const displayName = userName || user?.full_name || 'User'
  const displayEmail = userEmail || user?.email || ''

  return (
    <>
      <header className="h-14 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 font-sans sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={toggle}
            className="p-2 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Command palette */}
          <CommandPalette />
        </div>

        <div className="flex items-center gap-2">
          {/* Quick create */}
          <button
            onClick={() => setShowQuickCreate(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors text-xs font-mono uppercase tracking-wider"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Create</span>
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User */}
          <div className="flex items-center gap-2 pl-3 ml-2 border-l border-white/10">
            <div className="w-7 h-7 bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white/70" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-foreground font-sans">{displayName}</p>
              <p className="text-[10px] text-white/40 font-mono">{userRole || displayEmail}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick create dropdown */}
      {showQuickCreate && (
        <QuickCreate onClose={() => setShowQuickCreate(false)} />
      )}
    </>
  )
}
