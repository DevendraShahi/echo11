import { createClient } from '@/lib/supabase/server'
import { Invoice } from '@/types/lab'
import { InvoiceList } from '@/components/lab/unified/InvoiceList'
import { LabButton } from '@/components/ui/LabButton'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    
  return data as Invoice[] || []
}

async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { canEdit: false }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') return { canEdit: true }
  
  const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', user.id)
  return { canEdit: (count ?? 0) > 0 }
}

export default async function ClientInvoicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [invoices, { canEdit }] = await Promise.all([
    getClientInvoices(id),
    getUserRole()
  ])

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Link href={`/lab/invoices/new?client=${id}`}>
            <LabButton className="font-mono text-xs uppercase tracking-wider">
              <Plus className="w-3 h-3 mr-2" />Create Invoice
            </LabButton>
          </Link>
        </div>
      )}
      
      <InvoiceList invoices={invoices} showClient={false} />
    </div>
  )
}
