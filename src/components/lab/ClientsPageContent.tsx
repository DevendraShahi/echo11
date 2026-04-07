'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LabButton } from '@/components/ui/LabButton'
import { Plus, Search, Users, DollarSign, AlertTriangle, TrendingUp, Grid, List, Filter, X } from 'lucide-react'
import { ClientFormModal } from './ClientFormModal'
import { ClientCard } from './ClientCard'
import { sendClientPortalInvite, deleteClient, ClientWithRelations, ClientStats } from '@/lib/actions/client-actions'
import { cn } from '@/lib/utils'

type ClientWithStats = ClientWithRelations

type FilterOption = 'all' | 'with_portal' | 'without_portal' | 'lead' | 'prospect' | 'active' | 'at_risk' | 'inactive'
type SortOption = 'recent' | 'name' | 'revenue' | 'projects'

interface ClientsPageContentProps {
  initialClients: ClientWithStats[]
  initialStats: ClientStats
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'with_portal', label: 'With Portal' },
  { value: 'without_portal', label: 'Without Portal' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'projects', label: 'Projects' },
]

export function ClientsPageContent({ initialClients, initialStats }: ClientsPageContentProps) {
  const [clients, setClients] = useState(initialClients)
  const [stats] = useState(initialStats)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  const industries = [...new Set(clients.map(c => c.industry).filter(Boolean))] as string[]

  useEffect(() => {
    const channel = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setClients(prev => [payload.new as ClientWithStats, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setClients(prev => prev.filter(c => c.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setClients(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const filteredClients = clients
    .filter(client => {
      if (filterBy === 'with_portal') return !!client.invitation_sent_at
      if (filterBy === 'without_portal') return !client.invitation_sent_at
      if (['lead', 'prospect', 'active', 'at_risk', 'inactive'].includes(filterBy)) {
        return client.current_status?.status === filterBy
      }
      return true
    })
    .filter(client => {
      if (industryFilter !== 'all' && client.industry !== industryFilter) return false
      return true
    })
    .filter(client => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        client.company_name.toLowerCase().includes(query) ||
        client.contact_name?.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.tags?.some(t => t.toLowerCase().includes(query))
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.company_name.localeCompare(b.company_name)
      if (sortBy === 'revenue') return (b.total_revenue || 0) - (a.total_revenue || 0)
      if (sortBy === 'projects') return (b.projects_count || 0) - (a.projects_count || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const handleSendInvite = async (clientId: string) => {
    try {
      const result = await sendClientPortalInvite(clientId)
      if (!result.success) {
        alert(result.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Failed to send invitation')
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      const result = await deleteClient(clientId)
      if (result.success) {
        setClients(clients.filter(c => c.id !== clientId))
      } else {
        alert(result.error || 'Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  const handleEditClient = (client: ClientWithStats) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterBy('all')
    setIndustryFilter('all')
    setSortBy('recent')
  }

  const hasActiveFilters = searchQuery || filterBy !== 'all' || industryFilter !== 'all'

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-sans">Clients</h1>
            <p className="text-white/50 mt-1 font-mono text-sm">Manage your client relationships</p>
          </div>
          <LabButton 
            onClick={() => {
              setEditingClient(null)
              setShowModal(true)
            }}
            className="font-mono uppercase text-xs tracking-wider"
            data-tour="add-client"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </LabButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-px bg-white/5 border border-white/5" data-tour="client-stats">
          <div className="bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-accent/10 border border-accent/20">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold text-white font-sans">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Active</p>
                <p className="text-xl font-bold text-emerald-400 font-sans">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">At Risk</p>
                <p className="text-xl font-bold text-amber-400 font-sans">{stats.at_risk}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Revenue</p>
                <p className="text-xl font-bold text-blue-400 font-sans">${(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                <DollarSign className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-cyan-400 font-sans">${(stats.pendingAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2" data-tour="client-filters">
          <div className="relative flex-1 min-w-[200px] max-w-sm" data-tour="client-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border transition-colors font-mono text-sm",
              showFilters || hasActiveFilters 
                ? "bg-accent/10 border-accent/30 text-accent" 
                : "bg-[#0a0a0a] border-white/10 text-white/60 hover:text-white hover:border-white/20"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-accent rounded-full" />
            )}
          </button>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
            ))}
          </select>

          {industries.length > 0 && (
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none"
            >
              <option value="all" className="bg-black">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind} className="bg-black">{ind}</option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-px bg-white/10 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-white/40 hover:text-white transition-colors font-mono text-sm"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 border border-white/5 bg-[#0a0a0a]">
            <div className="w-16 h-16 flex items-center justify-center mb-6 border border-white/10">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-sans">
              {hasActiveFilters ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-white/40 mb-6 text-center max-w-sm font-mono text-sm">
              {hasActiveFilters 
                ? 'Try adjusting your search or filters' 
                : 'Add your first client to start tracking projects and invoicing'}
            </p>
            {!hasActiveFilters && (
              <LabButton 
                onClick={() => {
                  setEditingClient(null)
                  setShowModal(true)
                }}
                className="font-mono uppercase text-xs tracking-wider"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </LabButton>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {filteredClients.map((client, index) => (
              <ClientCard
                key={client.id}
                client={client}
                index={index}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onSendInvite={handleSendInvite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-px bg-white/5 border border-white/5">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white text-sm">
                    {client.company_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white font-sans">{client.company_name}</p>
                    <p className="text-sm text-white/40 font-mono">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-white/50 font-mono">{client.projects_count || 0} projects</p>
                    <p className="text-sm text-emerald-400 font-mono">${(client.total_revenue || 0).toLocaleString()}</p>
                  </div>
                  {client.current_status && (
                    <span className={cn(
                      "px-3 py-1 text-xs font-mono uppercase tracking-wider border",
                      client.current_status.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      client.current_status.status === 'at_risk' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      client.current_status.status === 'prospect' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                      client.current_status.status === 'inactive' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                      "bg-gray-500/10 border-gray-500/20 text-gray-400"
                    )}>
                      {client.current_status.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredClients.length > 0 && (
          <p className="text-sm text-white/30 text-center font-mono">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        )}
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
