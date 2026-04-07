'use client'

import { useState } from 'react'
import { Contract } from '@/types/lab'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { LabButton } from '@/components/ui/LabButton'
import { Plus, FileText, Calendar, DollarSign, Search, Eye, Download, Send, Trash2, File } from 'lucide-react'
import { ContractFormModal } from '@/components/lab/ContractFormModal'
import { deleteContract } from '@/lib/actions/contract-actions'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ContractsPageClientProps {
  initialContracts: Contract[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-white/5 border-white/10 text-white/40',
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  signed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  expired: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  terminated: 'bg-white/5 border-white/10 text-white/30',
}

export function ContractsPageClient({ initialContracts }: ContractsPageClientProps) {
  const [contracts, setContracts] = useState(initialContracts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    signed: contracts.filter(c => c.status === 'signed').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    totalValue: contracts.filter(c => c.status === 'signed').reduce((sum, c) => sum + (c.value || 0), 0),
  }

  const filteredContracts = contracts.filter(contract => {
    const clientName = (contract.client as { company_name?: string } | null)?.company_name || ''
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.contract_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleDelete(id: string, clientId: string) {
    if (!confirm('Delete this contract?')) return
    await deleteContract(id, clientId)
    setContracts(prev => prev.filter(c => c.id !== id))
  }

  const statusTabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'draft', label: 'Draft', count: stats.draft },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'signed', label: 'Signed', count: stats.signed },
    { id: 'expired', label: 'Expired', count: stats.expired },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contracts" 
        description="Manage client contracts and agreements"
        icon={FileText}
        action={<LabButton onClick={() => setShowCreateModal(true)} data-tour="new-contract"><Plus className="w-3 h-3 mr-2" />New Contract</LabButton>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
        <div className="p-4 bg-[#0a0a0a]">
          <p className="text-xs font-mono uppercase text-white/40">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 bg-[#0a0a0a]">
          <p className="text-xs font-mono uppercase text-white/40">Signed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.signed}</p>
        </div>
        <div className="p-4 bg-[#0a0a0a]">
          <p className="text-xs font-mono uppercase text-white/40">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
        </div>
        <div className="p-4 bg-[#0a0a0a]">
          <p className="text-xs font-mono uppercase text-white/40">Total Value</p>
          <p className="text-2xl font-bold text-accent mt-1">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search contracts..."
          />
        </div>
        <div className="flex gap-1 bg-white/[0.03] border border-white/10 p-1">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
                statusFilter === tab.id
                  ? "bg-accent/20 text-accent"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-1 opacity-60">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts found"
          description={searchQuery ? "Try adjusting your search" : "Create your first contract to get started"}
          action={searchQuery ? undefined : { label: 'Create Contract', onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <div className="space-y-px bg-white/5 border border-white/5">
          {filteredContracts.map(contract => {
            const client = contract.client as { company_name?: string; contact_name?: string } | null
            return (
              <div key={contract.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center border",
                    contract.file_url ? "border-accent/30 bg-accent/10" : "border-white/10 bg-white/5"
                  )}>
                    {contract.file_url ? (
                      <File className="w-4 h-4 text-accent" />
                    ) : (
                      <FileText className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/lab/contracts/${contract.id}`} className="text-white font-mono text-sm hover:text-accent transition-colors truncate">
                        {contract.title}
                      </Link>
                      {contract.contract_number && (
                        <span className="text-xs text-white/30 font-mono shrink-0">{contract.contract_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40 font-mono">{client?.company_name || 'Unknown Client'}</span>
                      {contract.start_date && (
                        <span className="text-xs text-white/30 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(contract.start_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {contract.value && (
                    <span className="text-white/60 font-mono text-sm">${contract.value.toLocaleString()}</span>
                  )}
                  <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", statusColors[contract.status || 'draft'])}>
                    {contract.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/lab/contracts/${contract.id}`}>
                      <button className="p-1.5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    {contract.file_url && (
                      <a href={contract.file_url} target="_blank" className="p-1.5 border border-white/10 hover:border-white/20 text-white/40 hover:text-accent transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(contract.id, contract.client_id)} className="p-1.5 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <ContractFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
