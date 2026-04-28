'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Calendar, FileText, FolderKanban, LayoutDashboard, MessageSquare, ScrollText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getClientUnreadTeamMessagesCount } from '@/lib/actions/client-message-actions'

interface NavItem {
  label: string
  href: string
  prefix: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/client', prefix: '/client', icon: LayoutDashboard },
  { label: 'Projects', href: '/client/projects', prefix: '/client/projects', icon: FolderKanban },
  { label: 'Invoices', href: '/client/invoices', prefix: '/client/invoices', icon: FileText },
  { label: 'Settings', href: '/client/settings', prefix: '/client/settings', icon: Settings },
  { label: 'Contracts', href: '/client/contracts', prefix: '/client/contracts', icon: ScrollText },
  { label: 'Meetings', href: '/client/meetings', prefix: '/client/meetings', icon: Calendar },
  { label: 'Messages', href: '/client/messages', prefix: '/client/messages', icon: MessageSquare },
]

function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.href === '/client') {
    return pathname === '/client'
  }
  return pathname.startsWith(item.prefix)
}

interface ClientNavigationProps {
  initialUnreadMessageCount?: number
}

export function ClientNavigation({ initialUnreadMessageCount = 0 }: ClientNavigationProps) {
  const pathname = usePathname()
  const [unreadMessageCount, setUnreadMessageCount] = useState(initialUnreadMessageCount)
  const supabase = useMemo(() => createClient(), [])

  const loadUnreadMessageCount = useCallback(async () => {
    const count = await getClientUnreadTeamMessagesCount()
    setUnreadMessageCount(count)
  }, [])

  useEffect(() => {
    void loadUnreadMessageCount()

    const channel = supabase
      .channel('client-navigation-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_messages' }, () => {
        void loadUnreadMessageCount()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadUnreadMessageCount, supabase])

  return (
    <nav className="border-b border-white/10 bg-black/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-mono transition-colors',
                  active
                    ? 'border-accent text-accent bg-white/5'
                    : 'border-transparent text-white/60 hover:text-accent hover:bg-white/5 hover:border-accent'
                )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.label === 'Messages' && unreadMessageCount > 0 && (
                    <span className={cn(
                      'px-1.5 py-0.5 text-[10px] font-mono border',
                      active
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : 'bg-white/5 border-white/20 text-white/70'
                    )}>
                      {unreadMessageCount}
                    </span>
                  )}
                </Link>
              )
            })}
        </div>
      </div>
    </nav>
  )
}
