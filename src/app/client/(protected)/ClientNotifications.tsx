'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, CheckCircle, Clock, FileText, FolderKanban, DollarSign, X } from 'lucide-react'
import { format } from 'date-fns'
import { getClientNotifications, markNotificationRead } from '@/lib/actions/portal-notification-actions'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  created_at: string
}

const notificationIcons: Record<string, typeof Bell> = {
  invoice: DollarSign,
  project: FolderKanban,
  contract: FileText,
  task: CheckCircle,
  meeting: Clock,
}

const notificationColors: Record<string, string> = {
  invoice: 'text-accent bg-accent/10',
  project: 'text-accent bg-accent/10',
  contract: 'text-accent bg-accent/10',
  task: 'text-accent bg-accent/10',
  meeting: 'text-accent bg-accent/10',
}

export function ClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getClientNotifications()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const channel = supabase
      .channel('client-header-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        void fetchNotifications()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_messages' }, () => {
        void fetchNotifications()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    await markNotificationRead(id)

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          const nextState = !isOpen
          setIsOpen(nextState)
          if (nextState) {
            setLoading(true)
            void fetchNotifications()
          }
        }}
        className="relative p-2 hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-accent text-[10px] font-bold text-black flex items-center justify-center font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a0a] border border-white/10 shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium text-white">Notifications</h3>
              <span className="text-xs text-white/40">{unreadCount} unread</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-accent/30 border-t-accent animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  const colorClass = notificationColors[notification.type] || 'text-white/40 bg-white/10'

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-accent/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-white/50 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-white/30 mt-1">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-white/30 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
