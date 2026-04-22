'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, FileText, FolderKanban, CheckSquare, MessageSquare, DollarSign, User } from 'lucide-react'
import { format } from 'date-fns'

type ActivityItem = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

const activityIcons: Record<string, typeof Activity> = {
  project: FolderKanban,
  task: CheckSquare,
  invoice: DollarSign,
  contract: FileText,
  note: MessageSquare,
  client: User,
}

const activityColors: Record<string, string> = {
  project: 'text-blue-400 bg-blue-500/10',
  task: 'text-emerald-400 bg-emerald-500/10',
  invoice: 'text-amber-400 bg-amber-500/10',
  contract: 'text-purple-400 bg-purple-500/10',
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
    'created note': 'added a note',
    'updated client': 'updated client information',
  }
  return actionMap[action] || action
}

export function PortalActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!client) {
        setLoading(false)
        return
      }

      const { data: projectIds } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', client.id)

      const ids = projectIds?.map(p => p.id) || []

      if (ids.length === 0) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('activities')
        .select('*')
        .in('entity_id', ids)
        .order('created_at', { ascending: false })
        .limit(10)

      setActivities(data || [])
      setLoading(false)
    }

    fetchActivities()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
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
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-medium text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/5">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.entity_type] || Activity
          const colorClass = activityColors[activity.entity_type] || 'text-white/40 bg-white/10'

          return (
            <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
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
        })}
      </div>
    </div>
  )
}
