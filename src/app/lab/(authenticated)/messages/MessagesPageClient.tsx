'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, FolderKanban, MessageSquare, Search, Send, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getClientMessagesForTeam,
  getClientProjectsForTeam,
  markTeamMessagesRead,
  sendTeamMessage,
  type ClientMessage,
  type TeamClientProjectContext,
} from '@/lib/actions/client-message-actions'
import { SearchInput } from '@/components/ui/SearchInput'
import { LabButton } from '@/components/ui/LabButton'
import { DataState } from '@/components/lab/primitives/DataState'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { cn } from '@/lib/utils'

export type MessageConversation = {
  clientId: string
  clientName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  senderType: 'client' | 'team'
}

interface MessagesPageClientProps {
  initialConversations: MessageConversation[]
  initialSelectedClientId?: string | null
  canReply: boolean
}

type ConversationFilter = 'all' | 'unread'

function getProjectStatusMeta(status: string) {
  if (status === 'active') return { label: 'Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  if (status === 'on_hold') return { label: 'On Hold', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300' }
  if (status === 'completed') return { label: 'Completed', classes: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' }
  if (status === 'archived') return { label: 'Archived', classes: 'border-white/20 bg-white/5 text-white/60' }
  return { label: 'Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
}

function getDeadlineMeta(deadline: string | null) {
  if (!deadline) return { label: 'No deadline', classes: 'text-white/45' }

  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, classes: 'text-rose-300' }
  if (diff === 0) return { label: 'Due today', classes: 'text-amber-300' }
  if (diff <= 3) return { label: `${diff}d left`, classes: 'text-amber-300' }
  return { label: `${diff}d left`, classes: 'text-emerald-300' }
}

export function MessagesPageClient({
  initialConversations,
  initialSelectedClientId,
  canReply,
}: MessagesPageClientProps) {
  const [conversations, setConversations] = useState<MessageConversation[]>(initialConversations)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialSelectedClientId || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>('all')
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [clientProjects, setClientProjects] = useState<TeamClientProjectContext[]>([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [showMobileThread, setShowMobileThread] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const selectedConversation = conversations.find((conversation) => conversation.clientId === selectedClientId) || null

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return conversations.filter((conversation) => {
      const matchesFilter = conversationFilter === 'all' || conversation.unreadCount > 0
      if (!matchesFilter) return false

      if (!query) return true
      return (
        conversation.clientName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
      )
    })
  }, [conversations, conversationFilter, searchQuery])

  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)
  const clientTurnCount = messages.filter((message) => message.sender_type === 'client').length
  const teamTurnCount = messages.filter((message) => message.sender_type === 'team').length

  const primaryProject = useMemo(() => {
    if (clientProjects.length === 0) return null

    const active = clientProjects.find((project) => project.status === 'active')
    if (active) return active

    return [...clientProjects].sort(
      (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    )[0]
  }, [clientProjects])

  useEffect(() => {
    if (!selectedClientId && conversations.length > 0) {
      setSelectedClientId(conversations[0].clientId)
    }
  }, [conversations, selectedClientId])

  useEffect(() => {
    if (!selectedClientId) return
    void loadThread(selectedClientId, true)
    void loadClientProjects(selectedClientId)
  }, [selectedClientId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedClientId) return

    const channel = supabase
      .channel(`lab-messages-thread-${selectedClientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${selectedClientId}`,
        },
        (payload) => {
          const incoming = payload.new as ClientMessage
          setMessages((prev) => (prev.some((item) => item.id === incoming.id) ? prev : [...prev, incoming]))
          setConversations((prev) =>
            prev
              .map<MessageConversation>((conversation) =>
                conversation.clientId === selectedClientId
                  ? {
                      ...conversation,
                      lastMessage: incoming.content,
                      lastMessageAt: incoming.created_at,
                      senderType: incoming.sender_type as 'client' | 'team',
                      unreadCount:
                        incoming.sender_type === 'client' && !incoming.read_by_team
                          ? conversation.unreadCount + 1
                          : conversation.unreadCount,
                    }
                  : conversation
              )
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [selectedClientId, supabase])

  async function loadThread(clientId: string, markRead: boolean) {
    setLoadingThread(true)
    try {
      if (markRead) {
        await markTeamMessagesRead(clientId)
      }

      const thread = await getClientMessagesForTeam(clientId)
      setMessages([...thread].reverse())
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.clientId === clientId ? { ...conversation, unreadCount: 0 } : conversation
        )
      )
    } finally {
      setLoadingThread(false)
    }
  }

  async function loadClientProjects(clientId: string) {
    setLoadingProjects(true)
    try {
      const projects = await getClientProjectsForTeam(clientId)
      setClientProjects(projects)
    } finally {
      setLoadingProjects(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const content = messageInput.trim()
    if (!content || !selectedClientId || sendingMessage) return

    setSendingMessage(true)
    setMessageInput('')

    try {
      const result = await sendTeamMessage(selectedClientId, content)
      if (!result.success) {
        setMessageInput(content)
        return
      }

      const createdAt = result.message?.created_at || new Date().toISOString()
      setConversations((prev) =>
        prev
          .map<MessageConversation>((conversation) =>
            conversation.clientId === selectedClientId
              ? {
                  ...conversation,
                  lastMessage: content,
                  lastMessageAt: createdAt,
                  senderType: 'team',
                }
              : conversation
          )
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      )

      if (result.message) {
        setMessages((prev) => [...prev, result.message as ClientMessage])
      } else {
        await loadThread(selectedClientId, false)
      }
    } finally {
      setSendingMessage(false)
    }
  }

  const activeFilterCount = conversationFilter === 'all'
    ? conversations.length
    : conversations.filter((conversation) => conversation.unreadCount > 0).length

  return (
    <div className="space-y-6">
      <LabPageHeader
        title="Messages"
        description="Team inbox with project-aware client conversation workflow"
        icon={MessageSquare}
      />

      <MetricStrip
        items={[
          { label: 'Conversations', value: conversations.length },
          { label: 'Unread Queued', value: unreadTotal, tone: unreadTotal > 0 ? 'warning' : 'success' },
          { label: 'Client Turns', value: clientTurnCount },
          { label: 'Team Replies', value: teamTurnCount, tone: canReply ? 'accent' : 'default' },
          {
            label: 'Project Context',
            value: primaryProject ? primaryProject.name : 'None',
            tone: primaryProject ? 'accent' : 'default',
          },
        ]}
      />

      <PanelSection
        title="Conversation Desk"
        description="Handle client requests and jump directly into related project execution"
      >
        {conversations.length === 0 ? (
          <DataState
            title="No client conversations yet"
            description="Client portal messages will appear here once clients start messaging."
            icon={MessageSquare}
          />
        ) : (
          <div className="flex h-[calc(100vh-22rem)] min-h-[560px] border border-white/10 bg-[linear-gradient(120deg,rgba(0,229,255,0.05),rgba(0,0,0,0)_35%),#04080d]">
            <aside className={cn('w-full border-r border-white/10 md:w-[360px] md:min-w-[360px]', showMobileThread && 'hidden md:block')}>
              <div className="space-y-3 border-b border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.13em] text-white/50 font-mono">Thread Queue</p>
                  <span className="text-[11px] text-white/40 font-mono">{activeFilterCount}</span>
                </div>

                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search client or message"
                  className="max-w-full"
                />

                <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setConversationFilter('all')}
                    className={cn(
                      'px-2 py-2 text-[10px] uppercase tracking-[0.13em] font-mono transition-colors',
                      conversationFilter === 'all' ? 'bg-accent/10 text-accent' : 'bg-black/50 text-white/60 hover:text-white'
                    )}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConversationFilter('unread')}
                    className={cn(
                      'inline-flex items-center justify-center gap-1 px-2 py-2 text-[10px] uppercase tracking-[0.13em] font-mono transition-colors',
                      conversationFilter === 'unread' ? 'bg-accent/10 text-accent' : 'bg-black/50 text-white/60 hover:text-white'
                    )}
                  >
                    Unread
                    {unreadTotal > 0 ? <span className="border border-amber-400/30 bg-amber-500/10 px-1 text-[9px] text-amber-300">{unreadTotal}</span> : null}
                  </button>
                </div>
              </div>

              <div className="h-[calc(100%-10.6rem)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="space-y-2 px-4 py-8 text-center text-sm text-white/35">
                    <Search className="mx-auto h-4 w-4 text-white/35" />
                    <p className="font-mono">No matching conversations</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const selected = selectedClientId === conversation.clientId
                    return (
                      <button
                        key={conversation.clientId}
                        type="button"
                        onClick={() => {
                          setSelectedClientId(conversation.clientId)
                          setShowMobileThread(true)
                        }}
                        className={cn(
                          'w-full border-b border-white/10 px-4 py-3 text-left transition-colors',
                          selected ? 'bg-accent/10' : 'hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm text-white font-sans">{conversation.clientName}</p>
                              <span
                                className={cn(
                                  'border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] font-mono',
                                  conversation.senderType === 'client'
                                    ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                                    : 'border-white/20 bg-white/5 text-white/55'
                                )}
                              >
                                {conversation.senderType === 'client' ? 'Client' : 'Team'}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-white/45 font-mono">{conversation.lastMessage}</p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-white/35 font-mono">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                            </span>
                            {conversation.unreadCount > 0 ? (
                              <span className="flex h-5 min-w-5 items-center justify-center border border-amber-400/30 bg-amber-500/10 px-1.5 text-[10px] text-amber-300 font-mono">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </aside>

            <section className={cn('flex min-w-0 flex-1', !showMobileThread && 'hidden md:flex')}>
              {selectedConversation ? (
                <div className="flex min-h-0 w-full">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowMobileThread(false)}
                          className="text-white/50 hover:text-white md:hidden"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex h-8 w-8 items-center justify-center border border-white/15 bg-white/5">
                          <User className="h-4 w-4 text-white/45" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white font-sans">{selectedConversation.clientName}</p>
                          <p className="text-[11px] text-white/35 font-mono">Client thread</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="border border-white/20 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/60 font-mono">
                          {messages.length} messages
                        </span>
                        {primaryProject ? (
                          <Link
                            href={`/lab/projects/${primaryProject.id}`}
                            className="inline-flex items-center gap-1 border border-accent/25 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                          >
                            Open Project
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/lab/clients/${selectedConversation.clientId}`}
                            className="border border-accent/25 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                          >
                            Open Client
                          </Link>
                        )}
                      </div>
                    </header>

                    <div className="border-b border-white/10 bg-black/40 px-4 py-2">
                      <p className="text-[11px] text-white/45 font-mono">
                        Last activity: {format(new Date(selectedConversation.lastMessageAt), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3">
                      {loadingThread ? (
                        <p className="pt-6 text-center text-sm text-white/35 font-mono">Loading thread...</p>
                      ) : messages.length === 0 ? (
                        <p className="pt-6 text-center text-sm text-white/35 font-mono">No messages in this thread.</p>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => {
                            const isTeam = message.sender_type === 'team'

                            return (
                              <div key={message.id} className={cn('flex', isTeam ? 'justify-end' : 'justify-start')}>
                                <article
                                  className={cn(
                                    'max-w-[80%] border px-3 py-2',
                                    isTeam
                                      ? 'border-accent/35 bg-accent/10'
                                      : 'border-white/15 bg-black/60'
                                  )}
                                >
                                  <p className="whitespace-pre-wrap text-sm text-white leading-relaxed">{message.content}</p>
                                  <p className={cn('mt-1 text-[10px] font-mono', isTeam ? 'text-accent/65' : 'text-white/35')}>
                                    {message.sender_name} · {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </p>
                                </article>
                              </div>
                            )
                          })}
                          <div ref={bottomRef} />
                        </div>
                      )}
                    </div>

                    {canReply ? (
                      <form onSubmit={handleSendMessage} className="border-t border-white/10 bg-black/50 p-3">
                        <div className="space-y-2">
                          <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Reply to client"
                            disabled={sendingMessage}
                            rows={3}
                            className="w-full resize-none border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-white/35 font-mono">Shift+Enter for line breaks</span>
                            <LabButton type="submit" disabled={sendingMessage || !messageInput.trim()}>
                              <Send className="mr-1.5 h-4 w-4" />
                              Send
                            </LabButton>
                          </div>
                        </div>
                      </form>
                    ) : null}
                  </div>

                  <aside className="hidden w-[320px] shrink-0 border-l border-white/10 bg-black/40 xl:flex xl:flex-col">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.13em] text-white/50 font-mono">Project Context</p>
                      <p className="mt-1 text-sm text-white/75 font-sans">
                        {loadingProjects ? 'Loading linked projects...' : `${clientProjects.length} linked project(s)`}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                      {loadingProjects ? (
                        <p className="text-xs text-white/45 font-mono">Loading project context...</p>
                      ) : clientProjects.length === 0 ? (
                        <DataState
                          title="No linked projects"
                          description="This client thread is not currently linked to an active project scope."
                          icon={FolderKanban}
                        />
                      ) : (
                        <div className="space-y-3">
                          {clientProjects.map((project) => {
                            const statusMeta = getProjectStatusMeta(project.status)
                            const deadlineMeta = getDeadlineMeta(project.deadline)

                            return (
                              <article key={project.id} className="border border-white/10 bg-black/55 px-3 py-3">
                                <p className="text-sm text-white font-sans">{project.name}</p>
                                <div className="mt-2 flex items-center gap-1.5">
                                  <span className={cn('border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] font-mono', statusMeta.classes)}>
                                    {statusMeta.label}
                                  </span>
                                  <span className={cn('text-[10px] font-mono', deadlineMeta.classes)}>{deadlineMeta.label}</span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <Link
                                    href={`/lab/projects/${project.id}`}
                                    className="border border-accent/25 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                                  >
                                    Overview
                                  </Link>
                                  <Link
                                    href={`/lab/projects/${project.id}/delivery`}
                                    className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono hover:border-accent/35 hover:text-accent"
                                  >
                                    Delivery
                                  </Link>
                                  <Link
                                    href={`/lab/projects/${project.id}/finance`}
                                    className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono hover:border-accent/35 hover:text-accent"
                                  >
                                    Finance
                                  </Link>
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-white/35 font-mono">
                  Select a conversation to open thread.
                </div>
              )}
            </section>
          </div>
        )}
      </PanelSection>
    </div>
  )
}
