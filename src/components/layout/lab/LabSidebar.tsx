'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Receipt,
  FileText,
  Users,
  UserCircle,
  Settings,
  LogOut
} from 'lucide-react'
import { OnboardingChecklist, HelpModal } from '@/components/onboarding'
import { setPendingTour } from '@/components/onboarding/tourState'
import { createClient } from '@/lib/supabase/client'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'

const navigation = [
  { name: 'Dashboard', href: '/lab/dashboard', icon: LayoutDashboard, pageId: 'dashboard' },
  { name: 'Projects', href: '/lab/projects', icon: FolderKanban, pageId: 'projects' },
  { name: 'Tasks', href: '/lab/tasks', icon: CheckSquare, pageId: 'tasks' },
  { name: 'Meetings', href: '/lab/meetings', icon: Calendar, pageId: 'meetings' },
  { name: 'Invoices', href: '/lab/invoices', icon: Receipt, pageId: 'invoices' },
  { name: 'Contracts', href: '/lab/contracts', icon: FileText, pageId: 'contracts' },
  { name: 'Clients', href: '/lab/clients', icon: UserCircle, pageId: 'clients' },
  { name: 'Teams', href: '/lab/teams', icon: Users, pageId: 'teams' },
  { name: 'Settings', href: '/lab/settings', icon: Settings, pageId: 'settings' },
]

function getPageId(pathname: string): string {
  for (const item of navigation) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.pageId
    }
  }
  return 'dashboard'
}

interface LabSidebarProps {
  initialUnreadClientMessagesCount?: number
}

export function LabSidebar({ initialUnreadClientMessagesCount = 0 }: LabSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
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

  const handleStartTour = (pageId: string) => {
    localStorage.removeItem(`echo11_tour_${pageId}_done`)
    setPendingTour(pageId)
    router.push(`/lab/${pageId}`)
  }

  return (
    <>
      <aside className="w-64 bg-black/50 backdrop-blur-md border-r border-white/5 flex flex-col font-sans">
        <div className="p-6">
          <Link href="/lab/dashboard" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 bg-accent flex items-center justify-center"
              style={{ boxShadow: '0 0 15px var(--accent-glow)' }}
            >
              <span className="text-black font-bold text-sm font-mono">e11</span>
            </div>
            <span className="font-semibold text-foreground group-hover:text-accent transition-colors font-sans">
              echo11Lab
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-200 relative group font-sans',
                    isActive
                      ? 'text-accent'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent"
                      style={{ boxShadow: '0 0 10px var(--accent-glow)' }}
                    />
                  )}
                  <item.icon className={cn(
                    'w-5 h-5 transition-all duration-200',
                    isActive ? 'text-accent' : 'text-white/50 group-hover:text-white'
                  )} />
                  <span className="relative z-10 font-sans">{item.name}</span>
                  {item.pageId === 'clients' && unreadClientMessagesCount > 0 && (
                    <span className={cn(
                      'ml-auto px-1.5 py-0.5 text-[10px] font-mono border',
                      isActive
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : 'bg-white/5 border-white/20 text-white/70 group-hover:text-accent group-hover:border-accent/30'
                    )}>
                      {unreadClientMessagesCount}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-accent"
                      style={{ boxShadow: '0 0 8px var(--accent-glow)' }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <OnboardingChecklist
          onHelpClick={() => setHelpOpen(true)}
          onStartTour={handleStartTour}
        />

        <div className="p-3 border-t border-white/5">
          <button
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-none text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 font-sans"
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/lab/auth/login'
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-sans">Sign out</span>
          </button>
        </div>
      </aside>

      <HelpModal pageId={currentPageId} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
