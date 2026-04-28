'use client'

import { useState } from 'react'
import { FileText, CheckCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

type ContractData = {
  id: string
  title: string
  contract_number: string | null
  status: string | null
  value: number | null
  start_date: string | null
  end_date: string | null
  file_url: string | null
  sent_at: string | null
  signed_at: string | null
  created_at: string
}

interface ClientContractsClientProps {
  initialContracts: ContractData[]
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: 'text-white/50', bg: 'bg-white/10', label: 'Draft' },
  pending: { color: 'text-accent', bg: 'bg-accent/10', label: 'Pending' },
  signed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Signed' },
  expired: { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Expired' },
  terminated: { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Terminated' },
}

export function ClientContractsClient({ initialContracts }: ClientContractsClientProps) {
  const [contracts] = useState(initialContracts)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans">Contracts</h1>
          <p className="text-white/50 mt-1">View and manage your contracts</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No contracts yet</h3>
          <p className="text-white/40">Your contracts will appear here once created.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const status = statusConfig[contract.status || 'draft'] || statusConfig.draft
            
            return (
              <div 
                key={contract.id}
                className="p-5 bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white font-sans">{contract.title}</h3>
                      {contract.contract_number && (
                        <p className="text-white/40 text-sm font-mono mt-1">
                          {contract.contract_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-mono uppercase tracking-wider ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                  {contract.value && (
                    <div>
                      <p className="text-white/30 text-xs font-mono uppercase tracking-wider">Value</p>
                      <p className="text-white font-mono mt-1">${contract.value.toLocaleString()}</p>
                    </div>
                  )}
                  {contract.start_date && (
                    <div>
                      <p className="text-white/30 text-xs font-mono uppercase tracking-wider">Start Date</p>
                      <p className="text-white mt-1 font-mono text-sm">{format(new Date(contract.start_date), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  {contract.end_date && (
                    <div>
                      <p className="text-white/30 text-xs font-mono uppercase tracking-wider">End Date</p>
                      <p className="text-white mt-1 font-mono text-sm">{format(new Date(contract.end_date), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  {contract.signed_at && (
                    <div>
                      <p className="text-white/30 text-xs font-mono uppercase tracking-wider">Signed</p>
                      <p className="text-emerald-400 mt-1 flex items-center gap-1 font-mono text-sm">
                        <CheckCircle className="w-3 h-3" />
                        {format(new Date(contract.signed_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {contract.file_url && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <a
                      href={contract.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
