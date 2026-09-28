import { formatDistanceToNow } from 'date-fns'
import { Activity } from 'lucide-react'
import type { ActivityItem } from '@/lib/frontend/view-models'

interface ActivityTimelineProps {
  items: ActivityItem[]
}

const entityTypeIcons: Record<string, string> = {
  task: 'T',
  project: 'P',
  client: 'C',
  invoice: 'I',
  contract: 'K',
  meeting: 'M',
  message: 'Msg',
  system: 'Sys',
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="p-8 bg-white/5 border border-white/10 text-center">
        <Activity className="w-8 h-8 text-white/30 mx-auto mb-2" />
        <p className="text-sm text-white/50 font-sans">No recent activity</p>
        <p className="text-xs text-white/30 font-mono mt-1">Start working to see activity here</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Recent Activity</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/20 text-white/70 rounded-sm">
            {items.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {items.map((item) => {
          const typeLabel = entityTypeIcons[item.entityType] || '?'

          return (
            <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-mono text-white/50">{typeLabel}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-sans">
                  <span className="font-medium">{item.actorName}</span>{' '}
                  {item.action}
                </p>
                <p className="text-[10px] text-white/30 font-mono mt-1">
                  {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
