'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  LogOut,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { OnboardingChecklist, HelpModal } from '@/components/onboarding'
import { setPendingTour } from '@/components/onboarding/tourState'
import { createClient } from '@/lib/supabase/client'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'
import { useSidebarContext } from './LabShell'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  pageId: string
}

type NavSection = {
  label: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    label: 'CORE',
    items: [
      { name: 'Command Center', href: '/lab/dashboard', icon: LayoutDashboard, pageId: 'dashboard' },
    ],
  },
  {
    label: 'WORK',
    items: [
      { name: 'Projects', href: '/lab/projects', icon: FolderKanban, pageId: 'projects' },
      { name: 'Tasks', href: '/lab/tasks', icon: CheckSquare, pageId: 'tasks' },
      { name: 'Meetings', href: '/lab/meetings', icon: Calendar, pageId: 'meetings' },
      { name: 'Activity', href: '/lab/dashboard', icon: Activity, pageId: 'activity' },
    ],
  },
  {
    label: 'CLIENTS',
    items: [
      { name: 'Directory', href: '/lab/clients', icon: UserCircle, pageId: 'clients' },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { name: 'Invoices', href: '/lab/invoices', icon: Receipt, pageId: 'invoices' },
      { name: 'Contracts', href: '/lab/contracts', icon: FileText, pageId: 'contracts' },
    ],
  },
  {
    label: 'PEOPLE',
    items: [
      { name: 'Teams', href: '/lab/teams', icon: Users, pageId: 'teams' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'Settings', href: '/lab/settings', icon: Settings, pageId: 'settings' },
    ],
  },
]

function getPageId(pathname: string): string {
  for (const section of navigationSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.pageId
      }
    }
  }
  return 'dashboard'
}

interface LabSidebarProps {
  initialUnreadClientMessagesCount?: number
}

export function LabSidebar({ initialUnreadClientMessagesCount = 0 }: LabSidebarProps) {
  const { sidebarOpen } = useSidebarContext()
  const pathname = usePathname()
  const router = useRouter()
  const [helpOpen, setHelpOpen] = useState(false)
  const [unreadClientMessagesCount, setUnreadClientMessagesCount] = useState(initialUnreadClientMessagesCount)
  const supabase = useMemo(() => createClient(), [])

  const currentPageId = getPageId(pathname)
  const collapsed = !sidebarOpen

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

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/lab/auth/login'
  }

  return (
    <>
      <aside className={cn(
        'h-full bg-black/50 backdrop-blur-md border-r border-white/5 flex flex-col font-sans transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center border-b border-white/5 transition-all duration-300', collapsed ? 'p-3 justify-center' : 'p-5')}>
          <Link href="/lab/dashboard" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 bg-accent flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '0 0 15px var(--accent-glow)' }}
            >
              <span className="text-black font-bold text-sm font-mono">e11</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground group-hover:text-accent transition-colors font-sans">
                echo11Lab
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <h4 className="px-3 text-[10px] font-mono font-semibold text-white/30 uppercase tracking-wider mb-2">
                  {section.label}
                </h4>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const showBadge = item.pageId === 'clients' && unreadClientMessagesCount > 0

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 transition-all duration-200 relative font-sans',
                        collapsed ? 'justify-center py-2.5 px-0' : 'py-2 px-3',
                        isActive
                          ? 'text-accent bg-accent/5'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent"
                          style={{ boxShadow: '0 0 10px var(--accent-glow)' }}
                        />
                      )}
                      <item.icon className={cn(
                        'w-4 h-4 flex-shrink-0 transition-all duration-200',
                        isActive ? 'text-accent' : 'text-white/40 hover:text-white/80'
                      )} />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium tracking-wide">{item.name}</span>
                          {showBadge && (
                            <span className={cn(
                              'ml-auto px-1.5 py-0.5 text-[10px] font-mono border rounded-sm',
                              isActive
                                ? 'bg-accent/10 border-accent/30 text-accent'
                                : 'bg-white/5 border-white/20 text-white/70'
                            )}>
                              {unreadClientMessagesCount}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="px-2 pb-2">
            <OnboardingChecklist
              onHelpClick={() => setHelpOpen(true)}
              onStartTour={handleStartTour}
            />
          </div>
        )}

        <div className={cn('border-t border-white/5', collapsed ? 'p-2' : 'p-3')}>
          <button
            className={cn(
              'flex items-center gap-3 w-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200 font-sans',
              collapsed ? 'justify-center py-2.5 px-0' : 'py-2.5 px-3'
            )}
            onClick={handleSignOut}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <HelpModal pageId={currentPageId} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
