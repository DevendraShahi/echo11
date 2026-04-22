import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalMessagesClient } from './PortalMessagesClient'
import { getClientMessages, markClientMessagesRead } from '@/lib/actions/client-message-actions'

export default async function PortalMessagesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  await markClientMessagesRead(user.id)
  const messages = await getClientMessages(user.id)

  return <PortalMessagesClient initialMessages={messages} />
}
