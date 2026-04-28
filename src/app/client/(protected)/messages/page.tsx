import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientMessagesClient } from './ClientMessagesClient'
import { getClientMessages, markClientMessagesRead } from '@/lib/actions/client-message-actions'

type Message = {
  id: string
  client_id: string
  sender_type: 'client' | 'team'
  sender_name: string
  content: string
  read_by_client: boolean
  created_at: string
}

export default async function ClientMessagesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/client/auth/login')
  }

  await markClientMessagesRead()
  const messages: Message[] = await getClientMessages()

  return <ClientMessagesClient initialMessages={messages} />
}
