import { Contract } from '@/types/lab'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Eye, Download, FileText, File, Trash2, Calendar } from 'lucide-react'

const statusColors: Record<string, string> = {
  draft: 'bg-white/5 border-white/10 text-white/40',
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  signed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  expired: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  terminated: 'bg-white/5 border-white/10 text-white/30',
}

interface ContractListProps {
  contracts: Contract[]
  showClient?: boolean
  canEdit?: boolean
  onDelete?: (id: string, clientId: string) => void
}

export function ContractList({ contracts, showClient = true, canEdit = false, onDelete }: ContractListProps) {
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 border border-white/10 rounded-lg">
        <FileText className="w-12 h-12 text-white/20 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2 font-sans">No contracts found</h3>
        <p className="text-sm text-white/50 font-sans max-w-sm">
          There are no contracts matching this view.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
      {contracts.map(contract => {
        const client = contract.client as { company_name?: string; contact_name?: string } | null
        return (
          <div key={contract.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "w-10 h-10 flex items-center justify-center border shrink-0",
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
                  {showClient && client?.company_name && (
                    <span className="text-xs text-white/40 font-mono truncate">{client.company_name}</span>
                  )}
                  {contract.start_date && (
                    <span className="text-xs text-white/30 font-mono flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(contract.start_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 pl-4">
              {contract.value && (
                <span className="text-white/60 font-mono text-sm hidden sm:inline-block">${contract.value.toLocaleString()}</span>
              )}
              <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border rounded", statusColors[contract.status || 'draft'])}>
                {contract.status}
              </span>
              <div className="flex items-center gap-1">
                <Link href={`/lab/contracts/${contract.id}`}>
                  <button className="p-1.5 border border-transparent hover:border-white/20 text-white/40 hover:text-white transition-colors rounded" title="View">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </Link>
                {contract.file_url && (
                  <a href={contract.file_url} target="_blank" className="p-1.5 border border-transparent hover:border-white/20 text-white/40 hover:text-accent transition-colors rounded" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                {canEdit && onDelete && (
                  <button onClick={() => onDelete(contract.id, contract.client_id)} className="p-1.5 border border-transparent hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors rounded" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
