'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, CheckCircle, Clock, FileText, FolderKanban, DollarSign, X } from 'lucide-react'
import { format } from 'date-fns'

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

export function PortalNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!client) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!profile) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setNotifications(data || [])
      setLoading(false)
    }

    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-medium text-white">Notifications</h3>
              <span className="text-xs text-white/40">{unreadCount} unread</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
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
                        !notification.read ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
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
