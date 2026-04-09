'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, FileText, Users, Calendar, AlertCircle, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Notification } from '@/types/lab'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/actions/notification-actions'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

import { FolderKanban } from 'lucide-react'

const typeIcons: Record<string, React.ReactNode> = {
  info: <AlertCircle className="w-4 h-4" />,
  contract: <FileText className="w-4 h-4" />,
  invoice: <FileText className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  project: <FolderKanban className="w-4 h-4" />,
  task: <Check className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  info: 'text-blue-400',
  contract: 'text-cyan-400',
  invoice: 'text-emerald-400',
  meeting: 'text-amber-400',
  team: 'text-purple-400',
  project: 'text-violet-400',
  task: 'text-orange-400',
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()

    const supabase = createClient()
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const [notifs, count] = await Promise.all([
      getNotifications(),
      getUnreadCount()
    ])
    setNotifications(notifs)
    setUnreadCount(count)
    setLoading(false)
  }

  function removeNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function handleMarkAsRead(id: string) {
    removeNotification(id)
    await markAsRead(id)
  }

  async function handleLinkClick(id: string) {
    removeNotification(id)
    setIsOpen(false)
    await markAsRead(id)
  }

  async function handleMarkAllRead() {
    setNotifications([])
    setUnreadCount(0)
    await markAllAsRead()
  }

  async function handleDelete(id: string) {
    removeNotification(id)
    await deleteNotification(id)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-none transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--accent-glow)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white font-sans">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-accent hover:text-accent/80 font-mono uppercase tracking-wider"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-white/30 text-sm font-mono">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-white/30 text-sm font-mono">No notifications</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(notification => (
                    notification.link ? (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => handleLinkClick(notification.id)}
                        className="block p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5", typeColors[notification.type] || typeColors.info)}>
                            {typeIcons[notification.type] || typeIcons.info}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium font-sans", notification.read ? "text-white/60" : "text-white")}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-white/40 font-mono mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-white/30 font-mono mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-white/30 flex-shrink-0" />
                        </div>
                      </Link>
                    ) : (
                      <div 
                        key={notification.id}
                        className={cn(
                          "p-3 hover:bg-white/5 transition-colors cursor-pointer",
                          !notification.read && "bg-white/5"
                        )}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5", typeColors[notification.type] || typeColors.info)}>
                            {typeIcons[notification.type] || typeIcons.info}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium font-sans", notification.read ? "text-white/60" : "text-white")}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-white/40 font-mono mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-white/30 font-mono mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(notification.id) }}
                            className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}