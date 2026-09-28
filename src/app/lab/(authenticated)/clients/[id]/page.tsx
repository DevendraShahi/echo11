import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Building2, Clock3, Globe, Mail, MapPin, MessageSquare, Phone, Tags } from 'lucide-react'
import { ClientWithRelations } from '@/lib/actions/client-actions'
import { ClientOverviewActions } from './ClientOverviewActions'

async function getClientStats(clientId: string) {
  const supabase = await createClient()

  const { data: projectsData } = await supabase
    .from('projects')
    .select('status')
    .eq('client_id', clientId)

  const { data: invoicesData } = await supabase
    .from('invoices')
    .select('status, total')
    .eq('client_id', clientId)

  const totalRevenue = (invoicesData || [])
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  const pendingAmount = (invoicesData || [])
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  return {
    totalRevenue,
    pendingAmount,
    activeProjects: (projectsData || []).filter((project) => project.status === 'active').length,
    totalProjects: projectsData?.length || 0,
    totalInvoices: invoicesData?.length || 0,
    paidInvoices: (invoicesData || []).filter((invoice) => invoice.status === 'paid').length,
  }
}

async function getClientData(clientId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('clients')
    .select('*, contacts:client_contacts(*), current_status:client_statuses(*)')
    .eq('id', clientId)
    .single()

  return data as ClientWithRelations | null
}

async function getUserRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { canEdit: false }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') return { canEdit: true }

  const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', user.id)
  return { canEdit: (count ?? 0) > 0 }
}

function getLifecycleMeta(status: string | undefined) {
  if (status === 'active') return { label: 'Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  if (status === 'at_risk') return { label: 'At Risk', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300' }
  if (status === 'prospect') return { label: 'Prospect', classes: 'border-sky-500/30 bg-sky-500/10 text-sky-300' }
  if (status === 'inactive') return { label: 'Inactive', classes: 'border-rose-500/30 bg-rose-500/10 text-rose-300' }
  return { label: 'Lead', classes: 'border-white/20 bg-white/5 text-white/65' }
}

function getPortalMeta(client: ClientWithRelations) {
  if (client.invitation_accepted_at) {
    return { label: 'Portal Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  }
  if (client.invitation_sent_at) {
    return { label: 'Invite Pending', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300' }
  }
  return { label: 'No Portal Access', classes: 'border-white/20 bg-white/5 text-white/60' }
}

export default async function ClientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [client, stats, { canEdit }] = await Promise.all([
    getClientData(id),
    getClientStats(id),
    getUserRole(),
  ])

  if (!client) {
    notFound()
  }

  const lifecycleMeta = getLifecycleMeta(client.current_status?.status)
  const portalMeta = getPortalMeta(client)
  const primaryContact = client.contacts?.find((contact) => contact.is_primary) || client.contacts?.[0] || null
  const locationLabel = [client.city, client.state, client.country].filter(Boolean).join(', ') || client.country || 'Not specified'

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden border border-white/10 bg-[linear-gradient(155deg,rgba(0,229,255,0.06),rgba(0,0,0,0)_38%),#05090f]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Client Overview</p>
            <h1 className="truncate text-xl text-foreground font-sans">{client.company_name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/lab/messages?client=${client.id}`}
              className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </Link>
            {canEdit ? <ClientOverviewActions client={client} /> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-4">
          <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono ${lifecycleMeta.classes}`}>
            {lifecycleMeta.label}
          </span>
          <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono ${portalMeta.classes}`}>
            {portalMeta.label}
          </span>
          <span className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono">
            <Clock3 className="h-3 w-3" />
            Added {format(new Date(client.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px border border-white/10 bg-white/5 lg:grid-cols-4">
        <div className="bg-black/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Collected Revenue</p>
          <p className="mt-1 text-2xl text-emerald-300 font-mono">${(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-black/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Pending Amount</p>
          <p className="mt-1 text-2xl text-amber-300 font-mono">${(stats.pendingAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-black/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Projects</p>
          <p className="mt-1 text-2xl text-foreground font-mono">{stats.activeProjects}/{stats.totalProjects}</p>
        </div>
        <div className="bg-black/60 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Paid Invoices</p>
          <p className="mt-1 text-2xl text-cyan-300 font-mono">{stats.paidInvoices}/{stats.totalInvoices}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
        <section className="space-y-6">
          <article className="border border-white/10 bg-[#05090f]">
            <header className="border-b border-white/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Client Identity</p>
            </header>
            <div className="grid grid-cols-1 gap-px bg-white/5 md:grid-cols-2">
              <div className="bg-black/55 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Primary Contact</p>
                <p className="mt-1 text-sm text-white/85 font-sans">{primaryContact?.name || client.contact_name || 'Not set'}</p>
                <p className="mt-1 text-[11px] text-white/45 font-mono">{primaryContact?.role || 'Role not specified'}</p>
              </div>
              <div className="bg-black/55 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Industry</p>
                <p className="mt-1 text-sm text-white/85 font-sans">{client.industry || 'Not specified'}</p>
              </div>
              <div className="bg-black/55 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Source</p>
                <p className="mt-1 text-sm text-white/85 font-sans">{client.source || 'Not specified'}</p>
              </div>
              <div className="bg-black/55 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Timezone</p>
                <p className="mt-1 text-sm text-white/85 font-sans">{client.timezone || 'Not specified'}</p>
              </div>
            </div>
          </article>

          <article className="border border-white/10 bg-[#05090f]">
            <header className="border-b border-white/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Notes</p>
            </header>
            <div className="px-4 py-4">
              <p className="text-sm text-white/70 leading-relaxed">
                {client.notes?.trim() || 'No notes have been recorded for this client yet.'}
              </p>
            </div>
          </article>
        </section>

        <section className="space-y-6">
          <article className="border border-white/10 bg-[#05090f]">
            <header className="border-b border-white/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Contact Channels</p>
            </header>
            <div className="space-y-px bg-white/5">
              <div className="flex items-center gap-3 bg-black/55 px-4 py-3">
                <Mail className="h-4 w-4 text-white/40" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Email</p>
                  <a href={`mailto:${client.email}`} className="truncate text-sm text-white hover:text-accent font-mono">
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/55 px-4 py-3">
                <Phone className="h-4 w-4 text-white/40" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Phone</p>
                  <p className="truncate text-sm text-white font-mono">{client.phone || primaryContact?.phone || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/55 px-4 py-3">
                <Globe className="h-4 w-4 text-white/40" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Website</p>
                  {client.website ? (
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-accent hover:text-accent/80 font-mono">
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <p className="text-sm text-white/45 font-mono">Not specified</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/55 px-4 py-3">
                <MapPin className="h-4 w-4 text-white/40" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Location</p>
                  <p className="truncate text-sm text-white/80 font-sans">{locationLabel}</p>
                </div>
              </div>
            </div>
          </article>

          {client.tags && client.tags.length > 0 ? (
            <article className="border border-white/10 bg-[#05090f] px-4 py-4">
              <p className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">
                <Tags className="h-3.5 w-3.5" />
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {client.tags.map((tag) => (
                  <span key={tag} className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/60 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ) : null}

          <article className="border border-white/10 bg-[#05090f] px-4 py-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/lab/clients/${client.id}/projects`}
                className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
              >
                <Building2 className="h-3 w-3" />
                Projects
              </Link>
              <Link
                href={`/lab/clients/${client.id}/invoices`}
                className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
              >
                Invoices
              </Link>
              <Link
                href={`/lab/messages?client=${client.id}`}
                className="inline-flex items-center gap-1 border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
              >
                <MessageSquare className="h-3 w-3" />
                Message
              </Link>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
