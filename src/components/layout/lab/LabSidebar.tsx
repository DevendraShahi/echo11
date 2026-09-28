'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { FolderKanban, LayoutDashboard, LogOut, MessageSquare, Settings, UserCircle } from 'lucide-react'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { HelpModal } from '@/components/onboarding/HelpModal'
import { createClient } from '@/lib/supabase/client'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'
import { useLabNavigation } from './LabNavigationContext'

const navigation = [
  { name: 'Command', href: '/lab/command', icon: LayoutDashboard, pageId: 'command' },
  { name: 'Projects', href: '/lab/projects', icon: FolderKanban, pageId: 'projects' },
  { name: 'Clients', href: '/lab/clients', icon: UserCircle, pageId: 'clients' },
  { name: 'Messages', href: '/lab/messages', icon: MessageSquare, pageId: 'messages' },
  { name: 'Settings', href: '/lab/settings', icon: Settings, pageId: 'settings' },
] as const

function getPageId(pathname: string): string {
  for (const item of navigation) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.pageId
    }
  }
  return 'command'
}

interface LabSidebarProps {
  initialUnreadClientMessagesCount?: number
}

export function LabSidebar({ initialUnreadClientMessagesCount = 0 }: LabSidebarProps) {
  const pathname = usePathname()
  const { isSidebarOpen, closeSidebar } = useLabNavigation()
  const [helpOpen, setHelpOpen] = useState(false)
  const [unreadClientMessagesCount, setUnreadClientMessagesCount] = useState(initialUnreadClientMessagesCount)
  const supabase = useMemo(() => createClient(), [])

  const currentPageId = getPageId(pathname)

  const loadUnreadClientMessagesCount = useCallback(async () => {
    const count = await getTeamUnreadClientMessagesCount()
    setUnreadClientMessagesCount(count)
  }, [])

  useEffect(() => {
    void loadUnreadClientMessagesCount()

    const channel = supabase
      .channel('lab-sidebar-client-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_messages' }, () => {
        void loadUnreadClientMessagesCount()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadUnreadClientMessagesCount, supabase])

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(0,229,255,0.08),transparent_45%),#030303] backdrop-blur-md flex flex-col font-sans transition-transform duration-200 lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/lab/command" className="group flex items-center gap-3" onClick={closeSidebar}>
            <div className="h-9 w-9 border border-accent/30 bg-accent/10 flex items-center justify-center">
              <span className="text-[11px] text-accent font-bold font-mono tracking-[0.15em]">E11</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-white/40 font-mono">echo11</p>
              <p className="text-base text-foreground group-hover:text-accent transition-colors">Lab Command</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'group relative flex items-center gap-3 border px-3 py-2.5 transition-colors',
                  isActive
                    ? 'border-accent/35 bg-accent/10 text-accent'
                    : 'border-transparent text-white/55 hover:border-white/15 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive ? 'text-accent' : 'text-white/45 group-hover:text-white')} />
                <span className="text-xs uppercase tracking-[0.14em] font-mono">{item.name}</span>
                {item.pageId === 'messages' && unreadClientMessagesCount > 0 ? (
                  <span className="ml-auto border border-amber-400/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                    {unreadClientMessagesCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <OnboardingChecklist
          onHelpClick={() => setHelpOpen(true)}
          onStartTour={() => {
            window.location.href = '/lab/command'
          }}
        />

        <div className="p-3 border-t border-white/10">
          <button
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-xs uppercase tracking-[0.14em] font-mono text-white/50 transition-colors hover:border-white/15 hover:bg-white/5 hover:text-white"
            onClick={async () => {
              const { createClient: getClient } = await import('@/lib/supabase/client')
              const client = getClient()
              await client.auth.signOut()
              window.location.href = '/lab/auth/login'
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <HelpModal pageId={currentPageId} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
