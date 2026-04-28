'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, FileText, FolderKanban, CheckSquare, MessageSquare, DollarSign, User, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { getClientActivityFeed } from '@/lib/actions/client-activity-actions'

type ActivityItem = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ActivityEntityFilter = 'all' | 'project' | 'task' | 'invoice' | 'contract' | 'meeting' | 'note' | 'client'

const activityIcons: Record<string, typeof Activity> = {
  project: FolderKanban,
  task: CheckSquare,
  invoice: DollarSign,
  contract: FileText,
  meeting: CalendarDays,
  note: MessageSquare,
  client: User,
}

const activityColors: Record<string, string> = {
  project: 'text-blue-400 bg-blue-500/10',
  task: 'text-emerald-400 bg-emerald-500/10',
  invoice: 'text-amber-400 bg-amber-500/10',
  contract: 'text-accent bg-accent/10',
  meeting: 'text-violet-400 bg-violet-500/10',
  note: 'text-cyan-400 bg-cyan-500/10',
  client: 'text-rose-400 bg-rose-500/10',
}

function formatActivityAction(action: string): string {
  const actionMap: Record<string, string> = {
    'created project': 'created a new project',
    'updated project': 'updated project details',
    'completed project': 'marked project as complete',
    'created task': 'added a new task',
    'completed task': 'completed a task',
    'updated task': 'updated task status',
    'created invoice': 'generated an invoice',
    'sent invoice': 'sent invoice for payment',
    'paid invoice': 'marked invoice as paid',
    'created contract': 'created a new contract',
    'signed contract': 'signed the contract',
    'created meeting': 'scheduled a meeting',
    'created note': 'added a note',
    'updated client': 'updated client information',
  }
  return actionMap[action] || action
}

export function ClientActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<ActivityEntityFilter>('all')

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getClientActivityFeed(20)
        setActivities(data)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const filteredActivities = useMemo(() => {
    if (entityFilter === 'all') {
      return activities
    }

    return activities.filter((activity) => activity.entity_type === entityFilter)
  }, [activities, entityFilter])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent animate-spin mx-auto" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-white/30">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Activity className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-medium text-white">Recent Activity</h3>
      </div>
      <div className="px-4 py-3 border-b border-white/10 flex flex-wrap gap-2">
        {(['all', 'project', 'task', 'invoice', 'contract', 'meeting', 'note', 'client'] as ActivityEntityFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setEntityFilter(option)}
            className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wide border transition-colors ${
              entityFilter === option
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            {option === 'all' ? 'All' : option}
          </button>
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {filteredActivities.length === 0 ? (
          <div className="p-6 text-center text-sm text-white/40">No activity for this filter.</div>
        ) : (
          filteredActivities.map((activity) => {
          const Icon = activityIcons[activity.entity_type] || Activity
          const colorClass = activityColors[activity.entity_type] || 'text-white/40 bg-white/10'

          return (
            <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">
                    {formatActivityAction(activity.action)}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {format(new Date(activity.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          )
          })
        )}
      </div>
    </div>
  )
}
