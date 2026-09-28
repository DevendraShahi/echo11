import { createClient } from '@/lib/supabase/server'
import { getClientNotes } from '@/lib/actions/note-actions'
import { ClientNotesClient } from './ClientNotesClient'

async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { canEdit: false }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') return { canEdit: true }
  
  const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', user.id)
  return { canEdit: (count ?? 0) > 0 }
}

export default async function ClientNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [notes, { canEdit }] = await Promise.all([
    getClientNotes(id),
    getUserRole()
  ])

  return (
    <ClientNotesClient 
      initialNotes={notes} 
      canEdit={canEdit}
      clientId={id}
    />
  )
}
