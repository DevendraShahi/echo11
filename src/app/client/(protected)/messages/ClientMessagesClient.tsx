'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { markClientMessagesRead, sendClientMessage } from '@/lib/actions/client-message-actions'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  client_id: string
  sender_type: 'client' | 'team'
  sender_name: string
  content: string
  read_by_client: boolean
  created_at: string
}

interface ClientMessagesClientProps {
  initialMessages: Message[]
}

export function ClientMessagesClient({ initialMessages }: ClientMessagesClientProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function subscribeToThread() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!client || !active) return

      const channel = supabase
        .channel(`client-thread-${client.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'client_messages',
            filter: `client_id=eq.${client.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            setMessages((prev) => (prev.some((item) => item.id === newMessage.id) ? prev : [newMessage, ...prev]))
            if (newMessage.sender_type === 'team' && !newMessage.read_by_client) {
              void markClientMessagesRead()
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'client_messages',
            filter: `client_id=eq.${client.id}`,
          },
          (payload) => {
            const updatedMessage = payload.new as Message
            setMessages((prev) => prev.map((item) => (item.id === updatedMessage.id ? updatedMessage : item)))
          }
        )
        .subscribe()

      return channel
    }

    let channelPromise: Promise<ReturnType<typeof supabase.channel> | void> | null = subscribeToThread()

    return () => {
      active = false
      void (async () => {
        const channel = await channelPromise
        if (channel) {
          await supabase.removeChannel(channel)
        }
      })()
      channelPromise = null
    }
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const result = await sendClientMessage(content)

    if (result.success) {
      if (result.message) {
        setMessages((prev) => [result.message as Message, ...prev])
      } else {
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          client_id: messages[0]?.client_id || '',
          sender_type: 'client',
          sender_name: 'You',
          content,
          read_by_client: true,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [fallbackMessage, ...prev])
      }
    } else {
      setNewMessage(content)
    }
    setSending(false)
  }

  const teamMessages = messages.filter(m => m.sender_type === 'team')
  const clientMessages = messages.filter(m => m.sender_type === 'client')
  const unreadCount = teamMessages.filter(m => !m.read_by_client).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-sans">Messages</h1>
        <p className="text-white/50 mt-1 font-sans text-sm">Communicate with the echo11 team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Thread */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] border border-white/10 h-[500px] flex flex-col">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-center font-sans text-sm">No messages yet.<br/>Start a conversation with the echo11 team!</p>
                </div>
              ) : (
                [...messages].reverse().map((message) => {
                  const isTeam = message.sender_type === 'team'
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isTeam ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 ${
                          isTeam
                            ? 'bg-accent/10 border border-accent/20'
                            : 'bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3 text-white/50" />
                          <span className="text-xs text-white/50 font-mono">{message.sender_name}</span>
                          {isTeam && !message.read_by_client && (
                            <span className="w-2 h-2 bg-accent" />
                          )}
                        </div>
                        <p className="text-white">{message.content}</p>
                        <p className="text-xs text-white/30 mt-2 font-mono">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-3 bg-accent hover:bg-accent/90 text-black font-sans uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0a0a0a] border border-white/10">
            <h3 className="font-medium text-white mb-3 font-sans">Conversation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm font-sans">Team Messages</span>
                <span className="text-white font-sans">{teamMessages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm font-sans">Your Messages</span>
                <span className="text-white font-sans">{clientMessages.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm font-sans">Unread</span>
                <span className={`font-sans ${unreadCount > 0 ? 'text-accent' : 'text-white/50'}`}>
                  {unreadCount}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#0a0a0a] border border-white/10">
            <h3 className="font-medium text-white mb-3 font-sans">Tips</h3>
            <ul className="space-y-2 text-sm text-white/40">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span className="font-sans">Ask about project progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span className="font-sans">Request deliverables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span className="font-sans">Share feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span className="font-sans">Get clarifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
