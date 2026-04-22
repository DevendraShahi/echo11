'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClientMessage {
  id: string
  client_id: string
  sender_type: 'client' | 'team'
  sender_name: string
  content: string
  read_by_client: boolean
  read_by_team: boolean
  created_at: string
}

export async function getClientMessages(userId: string): Promise<ClientMessage[]> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return []

  const { data: messages } = await supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (messages || []) as ClientMessage[]
}

export async function sendClientMessage(
  userId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('auth_id', userId)
    .single()

  if (!client) {
    return { success: false, error: 'Client not found' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  const senderName = profile?.full_name || client.company_name || 'Client'

  const { error } = await supabase
    .from('client_messages')
    .insert({
      client_id: client.id,
      sender_type: 'client',
      sender_name: senderName,
      content,
      read_by_client: true,
    })

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/portal/messages')
  return { success: true }
}

export async function markClientMessagesRead(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return

  await supabase
    .from('client_messages')
    .update({ read_by_client: true })
    .eq('client_id', client.id)
    .eq('sender_type', 'team')
    .eq('read_by_client', false)
}
