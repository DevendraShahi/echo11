import { cn } from '@/lib/utils'
import { getStatusConfig } from '@/lib/frontend/status'
import type { SystemHealthStatus } from '@/lib/frontend/view-models'

interface SystemSyncStatusProps {
  health: SystemHealthStatus
}

export function SystemSyncStatus({ health }: SystemSyncStatusProps) {
  const statusConfig = getStatusConfig(health.status, 'systemHealth')

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', statusConfig.color === 'text-emerald-400' ? 'bg-emerald-400' : statusConfig.color === 'text-amber-400' ? 'bg-amber-400' : statusConfig.color === 'text-rose-400' ? 'bg-rose-400' : 'bg-white/40')} />
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">System Sync</h3>
        </div>
        <span className={cn('px-1.5 py-0.5 text-[10px] font-mono uppercase border rounded-sm', statusConfig.color, statusConfig.bg, statusConfig.border)}>
          {statusConfig.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Outbox</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-foreground font-sans">{health.outbox.pendingCount}</p>
              <p className="text-[10px] text-white/30 font-mono">Pending</p>
            </div>
            <div className={cn('p-2 bg-white/5 border', health.outbox.failedCount > 0 ? 'border-rose-500/20' : 'border-white/10')}>
              <p className={cn('text-lg font-bold font-sans', health.outbox.failedCount > 0 ? 'text-rose-400' : 'text-foreground')}>{health.outbox.failedCount}</p>
              <p className="text-[10px] text-white/30 font-mono">Failed</p>
            </div>
            <div className="p-2 bg-white/5 border border-white/10">
              <p className="text-lg font-bold text-foreground font-sans">{health.outbox.oldestPendingAge}m</p>
              <p className="text-[10px] text-white/30 font-mono">Oldest</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Projections</p>
          <div className="space-y-1">
            {[
              { name: 'Team Workload', fresh: health.projections.teamWorkload.fresh, lastUpdated: health.projections.teamWorkload.lastUpdated },
              { name: 'Activity', fresh: health.projections.activity.fresh, lastUpdated: health.projections.activity.lastUpdated },
              { name: 'Unread Counts', fresh: health.projections.unreadCounts.fresh, lastUpdated: health.projections.unreadCounts.lastUpdated },
            ].map(proj => (
              <div key={proj.name} className="flex items-center justify-between px-2 py-1.5 bg-white/5 border border-white/10">
                <span className="text-xs text-white/60 font-sans">{proj.name}</span>
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full', proj.fresh ? 'bg-emerald-400' : 'bg-amber-400')} />
                  <span className="text-[10px] text-white/30 font-mono">
                    {proj.lastUpdated ? new Date(proj.lastUpdated).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
