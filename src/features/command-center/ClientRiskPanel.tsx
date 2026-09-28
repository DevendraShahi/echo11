import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClientRiskSummary } from '@/lib/frontend/view-models'

interface ClientRiskPanelProps {
  clients: ClientRiskSummary[]
}

const riskColors: Record<string, { color: string; bg: string; border: string; label: string }> = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'High' },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Critical' },
}

const signalLabels: Record<string, string> = {
  overdue_invoices: 'Overdue invoices',
  stale_activity: 'Stale activity',
  open_blockers: 'Open blockers',
  contract_expiring: 'Contract expiring',
  unanswered_messages: 'Unanswered messages',
  inactive_invite: 'Inactive invite',
}

export function ClientRiskPanel({ clients }: ClientRiskPanelProps) {
  if (clients.length === 0) {
    return (
      <div className="p-8 bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-white/50 font-sans">No risk signals</p>
        <p className="text-xs text-white/30 font-mono mt-1">All clients are healthy</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Client Risk</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-sm">
            {clients.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {clients.map((client) => {
          const risk = riskColors[client.risk.level]

          return (
            <div key={client.clientId} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/lab/clients/${client.clientId}`} className="text-sm font-medium text-white font-sans hover:text-accent transition-colors truncate">
                      {client.name}
                    </Link>
                    <span className={cn('px-1.5 py-0.5 text-[10px] font-mono uppercase border rounded-sm', risk.color, risk.bg, risk.border)}>
                      {risk.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.risk.signals.map((signal, i) => (
                      <span key={i} className="text-[10px] text-white/40 font-mono bg-white/5 px-1.5 py-0.5 border border-white/10">
                        {signalLabels[signal.type] || signal.type}
                        {signal.count ? ` (${signal.count})` : ''}
                        {signal.days ? ` (${signal.days}d)` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span className="text-lg font-bold text-foreground font-sans">{client.risk.score}</span>
                  <p className="text-[10px] text-white/30 font-mono">risk score</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
