'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LabButton } from '@/components/ui/LabButton'
import { SearchInput } from '@/components/ui/SearchInput'
import {
  ArrowUpRight,
  ExternalLink,
  Filter,
  Grid,
  List,
  MessageSquare,
  Plus,
  Send,
  Users,
} from 'lucide-react'
import { ClientFormModal } from './ClientFormModal'
import { sendClientPortalInvite, deleteClient, ClientWithRelations, ClientStats } from '@/lib/actions/client-actions'
import { cn } from '@/lib/utils'
import { matchesQuery } from '@/features/lab/listing/filtering'
import { useListViewModel } from '@/features/lab/listing/useListViewModel'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

type ClientWithStats = ClientWithRelations

type FilterOption = 'all' | 'with_portal' | 'without_portal' | 'needs_reply' | 'lead' | 'prospect' | 'active' | 'at_risk' | 'inactive'
type SortOption = 'recent' | 'name' | 'revenue' | 'projects'

interface ClientsPageContentProps {
  initialClients: ClientWithStats[]
  initialStats: ClientStats
  canEdit?: boolean
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'needs_reply', label: 'Needs Reply' },
  { value: 'with_portal', label: 'With Client Access' },
  { value: 'without_portal', label: 'Without Client Access' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'projects', label: 'Projects' },
]

const lifecycleFilters: FilterOption[] = ['lead', 'prospect', 'active', 'at_risk', 'inactive']

function isFilterOption(value: string): value is FilterOption {
  return FILTER_OPTIONS.some((option) => option.value === value)
}

function getStatusMeta(status: string | undefined) {
  if (status === 'active') return { label: 'Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  if (status === 'at_risk') return { label: 'At Risk', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300' }
  if (status === 'prospect') return { label: 'Prospect', classes: 'border-sky-500/30 bg-sky-500/10 text-sky-300' }
  if (status === 'inactive') return { label: 'Inactive', classes: 'border-rose-500/30 bg-rose-500/10 text-rose-300' }
  return { label: 'Lead', classes: 'border-white/20 bg-white/5 text-white/65' }
}

function getPortalMeta(client: ClientWithStats) {
  if (client.invitation_accepted_at) {
    return { label: 'Portal Active', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
  }
  if (client.invitation_sent_at) {
    return { label: 'Invite Pending', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-300' }
  }
  return { label: 'No Portal Access', classes: 'border-white/20 bg-white/5 text-white/60' }
}

function getClientInitials(companyName: string): string {
  return companyName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ClientsPageContent({ initialClients, initialStats, canEdit = false }: ClientsPageContentProps) {
  const { notify, confirmAction } = useAppFeedback()
  const [clients, setClients] = useState(initialClients)
  const [stats] = useState(initialStats)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null)
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [pendingInviteClientId, setPendingInviteClientId] = useState<string | null>(null)
  const [pendingDeleteClientId, setPendingDeleteClientId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filterBy,
    setFilterBy,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    hasActiveControls,
    resetControls,
  } = useListViewModel<FilterOption, SortOption, 'grid' | 'list'>({
    defaultFilter: 'all',
    defaultSort: 'recent',
    defaultView: 'grid',
  })

  const resolvedSortBy = sortBy || 'recent'
  const resolvedViewMode = viewMode || 'grid'

  const refreshUnreadForClient = useCallback(async (clientId: string) => {
    const { count, error } = await supabase
      .from('client_messages')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('sender_type', 'client')
      .eq('read_by_team', false)

    if (error) {
      return
    }

    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? { ...client, unread_client_messages: count ?? 0 }
          : client
      )
    )
  }, [supabase])

  const industries = useMemo(
    () => [...new Set(clients.map((client) => client.industry).filter(Boolean))] as string[],
    [clients]
  )

  useEffect(() => {
    const clientsChannel = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newClient = payload.new as ClientWithStats
          setClients((prev) => [{
            ...newClient,
            projects_count: newClient.projects_count ?? 0,
            total_revenue: newClient.total_revenue ?? 0,
            active_invoices: newClient.active_invoices ?? 0,
            unread_client_messages: 0,
          }, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setClients((prev) => prev.filter((client) => client.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setClients((prev) => prev.map((client) => (
            client.id === payload.new.id ? { ...client, ...(payload.new as Partial<ClientWithStats>) } : client
          )))
        }
      })
      .subscribe()

    const clientMessagesChannel = supabase
      .channel('client-messages-unread-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_messages' }, (payload) => {
        const newRow = payload.new as { client_id?: string } | null
        const oldRow = payload.old as { client_id?: string } | null
        const newClientId = newRow?.client_id
        const oldClientId = oldRow?.client_id

        if (newClientId) {
          void refreshUnreadForClient(newClientId)
        }
        if (oldClientId && oldClientId !== newClientId) {
          void refreshUnreadForClient(oldClientId)
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(clientsChannel)
      void supabase.removeChannel(clientMessagesChannel)
    }
  }, [refreshUnreadForClient, supabase])

  useEffect(() => {
    const filterFromUrl = searchParams.get('filter')
    if (!filterFromUrl) return
    if (!isFilterOption(filterFromUrl)) return
    setFilterBy(filterFromUrl)
  }, [searchParams, setFilterBy])

  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        if (filterBy === 'with_portal') return !!client.invitation_sent_at
        if (filterBy === 'without_portal') return !client.invitation_sent_at
        if (filterBy === 'needs_reply') return (client.unread_client_messages || 0) > 0
        if (lifecycleFilters.includes(filterBy)) {
          return client.current_status?.status === filterBy
        }
        return true
      })
      .filter((client) => {
        if (industryFilter !== 'all' && client.industry !== industryFilter) return false
        return true
      })
      .filter((client) =>
        matchesQuery(searchQuery, [
          client.company_name,
          client.contact_name,
          client.email,
          ...(client.tags || []),
        ])
      )
      .sort((a, b) => {
        if (resolvedSortBy === 'name') return a.company_name.localeCompare(b.company_name)
        if (resolvedSortBy === 'revenue') return (b.total_revenue || 0) - (a.total_revenue || 0)
        if (resolvedSortBy === 'projects') return (b.projects_count || 0) - (a.projects_count || 0)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [clients, filterBy, industryFilter, resolvedSortBy, searchQuery])

  const quickFilterCounts = useMemo(() => ({
    all: clients.length,
    needs_reply: clients.filter((client) => (client.unread_client_messages || 0) > 0).length,
    active: clients.filter((client) => client.current_status?.status === 'active').length,
    at_risk: clients.filter((client) => client.current_status?.status === 'at_risk').length,
    without_portal: clients.filter((client) => !client.invitation_sent_at).length,
  }), [clients])

  const handleSendInvite = async (clientId: string) => {
    setPendingInviteClientId(clientId)
    try {
      const result = await sendClientPortalInvite(clientId)
      if (!result.success) {
        notify(result.error || 'Failed to send invitation', 'error')
      } else {
        notify('Client invitation sent', 'success')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      notify('Failed to send invitation', 'error')
    } finally {
      setPendingInviteClientId(null)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const confirmed = await confirmAction('Delete this client and associated client records?', {
      title: 'Delete Client',
      confirmLabel: 'Delete',
      tone: 'danger',
    })

    if (!confirmed) return

    setPendingDeleteClientId(clientId)
    try {
      const result = await deleteClient(clientId)
      if (result.success) {
        setClients((prev) => prev.filter((client) => client.id !== clientId))
        notify('Client deleted', 'success')
      } else {
        notify(result.error || 'Failed to delete client', 'error')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      notify('Failed to delete client', 'error')
    } finally {
      setPendingDeleteClientId(null)
    }
  }

  const handleEditClient = (client: ClientWithStats) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleClearFilters = () => {
    resetControls()
    setIndustryFilter('all')
  }

  const hasActiveFilters = hasActiveControls || industryFilter !== 'all'

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl text-white tracking-tight font-sans">Clients</h1>
            <p className="mt-1 text-sm text-white/50 font-mono">Relationship pipeline, delivery context, and communication status</p>
          </div>

          {canEdit ? (
            <LabButton
              onClick={() => {
                setEditingClient(null)
                setShowModal(true)
              }}
              className="font-mono text-xs uppercase tracking-[0.13em]"
              data-tour="add-client"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </LabButton>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/5 lg:grid-cols-5" data-tour="client-stats">
          <div className="bg-black/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Total Clients</p>
            <p className="mt-1 text-2xl text-white font-sans">{stats.total}</p>
          </div>
          <div className="bg-black/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Active</p>
            <p className="mt-1 text-2xl text-emerald-300 font-sans">{stats.active}</p>
          </div>
          <div className="bg-black/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">At Risk</p>
            <p className="mt-1 text-2xl text-amber-300 font-sans">{stats.at_risk}</p>
          </div>
          <div className="bg-black/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Collected Revenue</p>
            <p className="mt-1 text-2xl text-cyan-300 font-mono">${(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-black/60 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Pending Amount</p>
            <p className="mt-1 text-2xl text-sky-300 font-mono">${(stats.pendingAmount || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4 border border-white/10 bg-black/35 p-4" data-tour="client-filters">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search company, contact, email, or tags"
              className="max-w-lg"
              data-tour="client-search"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-2 border px-3 py-2 text-xs uppercase tracking-[0.13em] font-mono transition-colors',
                  showFilters || hasActiveFilters
                    ? 'border-accent/35 bg-accent/10 text-accent'
                    : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>

              <div className="flex items-center gap-px border border-white/10 bg-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2.5 transition-colors',
                    resolvedViewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2.5 transition-colors',
                    resolvedViewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <button
              onClick={() => setFilterBy('all')}
              className={cn(
                'border px-3 py-2 text-left text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                filterBy === 'all' ? 'border-accent/35 bg-accent/10 text-accent' : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              )}
            >
              All
              <span className="ml-2 text-white/40">{quickFilterCounts.all}</span>
            </button>
            <button
              onClick={() => setFilterBy('needs_reply')}
              className={cn(
                'border px-3 py-2 text-left text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                filterBy === 'needs_reply' ? 'border-accent/35 bg-accent/10 text-accent' : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              )}
            >
              Needs Reply
              <span className="ml-2 text-white/40">{quickFilterCounts.needs_reply}</span>
            </button>
            <button
              onClick={() => setFilterBy('active')}
              className={cn(
                'border px-3 py-2 text-left text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                filterBy === 'active' ? 'border-accent/35 bg-accent/10 text-accent' : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              )}
            >
              Active
              <span className="ml-2 text-white/40">{quickFilterCounts.active}</span>
            </button>
            <button
              onClick={() => setFilterBy('at_risk')}
              className={cn(
                'border px-3 py-2 text-left text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                filterBy === 'at_risk' ? 'border-accent/35 bg-accent/10 text-accent' : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              )}
            >
              At Risk
              <span className="ml-2 text-white/40">{quickFilterCounts.at_risk}</span>
            </button>
            <button
              onClick={() => setFilterBy('without_portal')}
              className={cn(
                'border px-3 py-2 text-left text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                filterBy === 'without_portal' ? 'border-accent/35 bg-accent/10 text-accent' : 'border-white/15 bg-white/5 text-white/65 hover:text-white'
              )}
            >
              No Portal
              <span className="ml-2 text-white/40">{quickFilterCounts.without_portal}</span>
            </button>
          </div>

          {showFilters ? (
            <div className="grid gap-2 md:grid-cols-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="border border-white/15 bg-black/60 px-3 py-2 text-sm text-white font-mono focus:border-accent focus:outline-none"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-black">
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="border border-white/15 bg-black/60 px-3 py-2 text-sm text-white font-mono focus:border-accent focus:outline-none"
              >
                <option value="all" className="bg-black">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry} className="bg-black">
                    {industry}
                  </option>
                ))}
              </select>

              <select
                value={resolvedSortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-white/15 bg-black/60 px-3 py-2 text-sm text-white font-mono focus:border-accent focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-black">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-white/45 hover:text-white font-mono"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {filteredClients.length === 0 ? (
          <div className="border border-white/10 bg-black/45 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-white/15 bg-white/5">
              <Users className="h-7 w-7 text-white/25" />
            </div>
            <h3 className="text-xl text-white font-sans">
              {hasActiveFilters ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/45 font-mono">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'Add your first client to start tracking delivery and finance in context.'}
            </p>
          </div>
        ) : resolvedViewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredClients.map((client) => {
              const statusMeta = getStatusMeta(client.current_status?.status)
              const portalMeta = getPortalMeta(client)
              const unread = client.unread_client_messages || 0

              return (
                <article
                  key={client.id}
                  className="border border-white/10 bg-[linear-gradient(160deg,rgba(0,229,255,0.06),rgba(5,8,12,0)_32%),#05090f] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-sm text-white font-mono">
                        {getClientInitials(client.company_name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg text-foreground font-sans">{client.company_name}</h3>
                        <p className="truncate text-sm text-white/50 font-mono">{client.contact_name || client.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {unread > 0 ? (
                        <span className="inline-flex items-center gap-1 border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-amber-300 font-mono">
                          <MessageSquare className="h-3 w-3" />
                          {unread}
                        </span>
                      ) : null}
                      <span className={cn('border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono', statusMeta.classes)}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-px border border-white/10 bg-white/5">
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Industry</p>
                      <p className="mt-1 truncate text-xs text-white/80 font-sans">{client.industry || 'Unspecified'}</p>
                    </div>
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Portal</p>
                      <p className="mt-1 text-xs font-mono">
                        <span className={cn('border px-1.5 py-0.5', portalMeta.classes)}>{portalMeta.label}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-px border border-white/10 bg-white/5">
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Projects</p>
                      <p className="mt-1 text-sm text-white font-mono">{client.projects_count || 0}</p>
                    </div>
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Revenue</p>
                      <p className="mt-1 text-sm text-emerald-300 font-mono">${(client.total_revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Open Invoices</p>
                      <p className="mt-1 text-sm text-white font-mono">{client.active_invoices || 0}</p>
                    </div>
                  </div>

                  {client.tags && client.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {client.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/55 font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                    <Link
                      href={`/lab/clients/${client.id}`}
                      className="inline-flex items-center gap-1 border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>

                    <Link
                      href={`/lab/messages?client=${client.id}`}
                      className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Message
                    </Link>

                    {canEdit ? (
                      <button
                        onClick={() => handleEditClient(client)}
                        className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-white/30 hover:text-white"
                      >
                        Edit
                      </button>
                    ) : null}

                    {canEdit && !client.invitation_sent_at ? (
                      <button
                        onClick={() => void handleSendInvite(client.id)}
                        disabled={pendingInviteClientId === client.id}
                        className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent disabled:opacity-60"
                      >
                        <Send className="h-3 w-3" />
                        {pendingInviteClientId === client.id ? 'Sending' : 'Invite'}
                      </button>
                    ) : null}

                    {client.invitation_accepted_at ? (
                      <a
                        href="/client"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Portal
                      </a>
                    ) : null}

                    {canEdit ? (
                      <button
                        onClick={() => void handleDeleteClient(client.id)}
                        disabled={pendingDeleteClientId === client.id}
                        className="inline-flex items-center gap-1 border border-rose-500/25 bg-rose-500/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-rose-300 font-mono hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-60"
                      >
                        {pendingDeleteClientId === client.id ? 'Deleting' : 'Delete'}
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => {
              const statusMeta = getStatusMeta(client.current_status?.status)
              const unread = client.unread_client_messages || 0

              return (
                <div key={client.id} className="border border-white/10 bg-[#05090f] p-3">
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.5fr_1fr_0.8fr_0.6fr_auto] xl:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-base text-white font-sans">{client.company_name}</p>
                      <p className="mt-1 truncate text-[11px] text-white/45 font-mono">{client.contact_name || client.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono', statusMeta.classes)}>{statusMeta.label}</span>
                      {unread > 0 ? (
                        <span className="border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-amber-300 font-mono">
                          {unread} unread
                        </span>
                      ) : null}
                    </div>

                    <div className="text-sm text-white/80 font-mono">{client.projects_count || 0} projects</div>
                    <div className="text-sm text-emerald-300 font-mono">${(client.total_revenue || 0).toLocaleString()}</div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/lab/clients/${client.id}`}
                        className="inline-flex items-center justify-center border border-white/15 bg-white/5 p-2 text-white/65 hover:border-accent/35 hover:text-accent"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/lab/messages?client=${client.id}`}
                        className="inline-flex items-center justify-center border border-white/15 bg-white/5 p-2 text-white/65 hover:border-accent/35 hover:text-accent"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredClients.length > 0 ? (
          <p className="text-center text-xs text-white/35 font-mono">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        ) : null}
      </div>

      <ClientFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingClient(null)
        }}
        onSuccess={() => {
          setEditingClient(null)
        }}
        editClient={editingClient}
      />
    </>
  )
}
