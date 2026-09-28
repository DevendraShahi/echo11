'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  getClientMessagesForTeam, 
  markTeamMessagesRead, 
  sendTeamMessage, 
  ClientMessage 
} from '@/lib/actions/client-message-actions'
import { LabButton } from '@/components/ui/LabButton'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function ClientMessagesClient({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  const loadMessages = useCallback(async (markRead = true) => {
    setMessagesLoading(true)
    try {
      if (markRead) {
        await markTeamMessagesRead(clientId)
      }
      const thread = await getClientMessagesForTeam(clientId)
      setMessages(thread)
    } catch (error) {
      console.error('Error loading client messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    void loadMessages(true)
  }, [loadMessages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`lab-client-thread-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMessage = payload.new as ClientMessage
          setMessages((prev) => (prev.some((item) => item.id === newMessage.id) ? prev : [newMessage, ...prev]))
          if (newMessage.sender_type === 'client' && !newMessage.read_by_team) {
            void markTeamMessagesRead(clientId)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ClientMessage
          setMessages((prev) => prev.map((item) => (item.id === updatedMessage.id ? updatedMessage : item)))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [clientId])

  async function handleSendTeamMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const content = messageInput.trim()
    if (!content || sendingMessage) return

    setSendingMessage(true)
    setMessageInput('')

    try {
      const result = await sendTeamMessage(clientId, content)
      if (!result.success) {
        setMessageInput(content)
        alert(result.error || 'Failed to send message')
        return
      }

      if (result.message) {
        setMessages((prev) => [result.message as ClientMessage, ...prev])
      } else {
        await loadMessages(false)
      }
    } finally {
      setSendingMessage(false)
    }
  }

  const unreadClientMessages = messages.filter(m => m.sender_type === 'client' && !m.read_by_team).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border border-white/5 bg-[#0a0a0a] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-white/60">Client Conversation</span>
        </div>
        <span className={cn(
          'px-2 py-0.5 text-xs font-mono uppercase tracking-wider border rounded',
          unreadClientMessages > 0
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-white/5 border-white/10 text-white/40'
        )}>
          {unreadClientMessages} unread
        </span>
      </div>

      <div className="border border-white/5 bg-[#0a0a0a] rounded-lg overflow-hidden">
        <div className="h-[500px] max-h-[60vh] overflow-y-auto p-4 space-y-3 flex flex-col-reverse border-b border-white/5">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-white/30 font-mono text-sm py-14">
              No messages yet.
            </div>
          ) : (
            messages.map((message) => {
              const isTeam = message.sender_type === 'team'
              return (
                <div key={message.id} className={cn('flex', isTeam ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[80%] border px-4 py-3 rounded-lg',
                    isTeam
                      ? 'bg-accent/10 border-accent/30'
                      : 'bg-white/5 border-white/10'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-white/50">{message.sender_name}</span>
                      {!isTeam && !message.read_by_team && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
                    </div>
                    <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[11px] text-white/30 font-mono mt-2">
                      {format(new Date(message.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={handleSendTeamMessage} className="p-4 bg-black/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Reply to client..."
              disabled={sendingMessage}
              className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
            <LabButton
              type="submit"
              disabled={sendingMessage || !messageInput.trim()}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {sendingMessage ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  Send
                </>
              )}
            </LabButton>
          </div>
        </form>
      </div>
    </div>
  )
}
