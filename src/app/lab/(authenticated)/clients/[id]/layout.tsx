import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Client } from '@/types/lab'
import { EntityHeader } from '@/components/lab/unified/EntityHeader'
import { Building2 } from 'lucide-react'
import { ClientNavTabs } from './ClientNavTabs'

async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }
  return data as Client
}

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = await getClient(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <EntityHeader
        title={client.company_name}
        subtitle={client.industry ? `${client.industry} • ${client.email}` : client.email}
        icon={Building2}
        backLink="/lab/clients"
        backLabel="Back to Clients"
      />

      <ClientNavTabs clientId={id} />

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}
