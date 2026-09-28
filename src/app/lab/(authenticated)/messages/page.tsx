import { createClient } from '@/lib/supabase/server'
import { MessagesPageClient } from './MessagesPageClient'

export interface MessageConversation {
  clientId: string
  clientName: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  senderType: 'client' | 'team'
}

async function getConversations(): Promise<MessageConversation[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('client_messages')
    .select('id, content, created_at, sender_type, read_by_team, client_id, client:clients(company_name)')
    .order('created_at', { ascending: false })
    .limit(400)

  if (!data || data.length === 0) {
    return []
  }

  const grouped = new Map<string, MessageConversation>()

  for (const message of data) {
    const clientId = message.client_id
    const existing = grouped.get(clientId)
    const clientName = (message.client as { company_name?: string } | null)?.company_name || 'Unknown client'

    if (!existing) {
      grouped.set(clientId, {
        clientId,
        clientName,
        lastMessage: message.content || '',
        lastMessageAt: message.created_at,
        unreadCount: message.sender_type === 'client' && !message.read_by_team ? 1 : 0,
        senderType: message.sender_type as 'client' | 'team',
      })
      continue
    }

    if (message.sender_type === 'client' && !message.read_by_team) {
      existing.unreadCount += 1
    }
  }

  return Array.from(grouped.values()).sort(
    (left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime()
  )
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const [conversations, resolvedSearchParams] = await Promise.all([getConversations(), searchParams])
  const initialSelectedClientId = resolvedSearchParams.client || conversations[0]?.clientId || null

  return (
    <MessagesPageClient
      initialConversations={conversations}
      initialSelectedClientId={initialSelectedClientId}
      canReply
    />
  )
}
