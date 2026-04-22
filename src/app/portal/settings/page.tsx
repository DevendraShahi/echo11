import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Building, Phone, Globe, Save, Loader2 } from 'lucide-react'
import { PortalSettingsForm } from './PortalSettingsForm'

type ClientData = {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
}

async function getClientData(userId: string): Promise<ClientData | null> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('auth_id', userId)
    .single()

  return client as ClientData | null
}

async function getProfileData(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single()

  return profile
}

export default async function PortalSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const client = await getClientData(user.id)
  const profile = await getProfileData(user.id)

  if (!client) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
        <p className="text-white/50">Your account is not linked to any client.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-sans">Settings</h1>
        <p className="text-white/50 mt-1">Manage your account and preferences</p>
      </div>

      <PortalSettingsForm 
        client={client} 
        profile={profile} 
      />
    </div>
  )
}
