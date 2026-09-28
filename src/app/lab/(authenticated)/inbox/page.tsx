import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { PageHeader } from '@/components/ui/PageHeader'
import { Activity } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  action: string
  entityType: string
  entityId: string
  actorName: string
  actorAvatar: string | null
  occurredAt: string
}

async function getRecentActivities(): Promise<ActivityItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  const organizationId = profile?.organization_id

  if (organizationId) {
    const { data: projectionRows, error: projectionError } = await supabase
      .from('activity_projection')
      .select('id, payload, occurred_at')
      .eq('organization_id', organizationId)
      .order('occurred_at', { ascending: false })
      .limit(50)

    if (!projectionError && projectionRows && projectionRows.length > 0) {
      const actorIds = [...new Set(
        projectionRows
          .map(row => {
            const payload = (row.payload || {}) as Record<string, unknown>
            return typeof payload.actor_id === 'string' ? payload.actor_id : null
          })
          .filter((id): id is string => Boolean(id))
      )]

      const userMap = new Map<string, { full_name: string | null; avatar_url: string | null }>()
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', actorIds)

        for (const actor of profiles || []) {
          userMap.set(actor.id, { full_name: actor.full_name, avatar_url: actor.avatar_url })
        }
      }

      return projectionRows.map(row => {
        const payload = (row.payload || {}) as Record<string, unknown>
        const eventType = typeof payload.event_type === 'string' ? payload.event_type : ''
        const actorId = typeof payload.actor_id === 'string' ? payload.actor_id : null
        const entityType = typeof payload.entity_type === 'string' ? payload.entity_type : ''
        const entityId = typeof payload.entity_id === 'string' ? payload.entity_id : ''

        return {
          id: row.id,
          action: eventType ? eventType.replace(/\./g, ' ') : 'performed an action',
          entityType,
          entityId,
          actorName: actorId ? userMap.get(actorId)?.full_name || 'Someone' : 'Someone',
          actorAvatar: actorId ? userMap.get(actorId)?.avatar_url || null : null,
          occurredAt: row.occurred_at,
        }
      })
    }
  }

  return []
}

export default async function InboxPage() {
  const activities = await getRecentActivities()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Activity feed and notifications across your workspace"
        icon={Activity}
      />

      {activities.length === 0 ? (
        <div className="text-center py-16 text-white/30 font-mono text-sm border border-white/5 bg-white/[0.02]">
          No recent activity
        </div>
      ) : (
        <div className="space-y-px bg-white/5 border border-white/5">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'flex items-center gap-4 p-4 bg-[#0a0a0a] hover:bg-white/[0.03] transition-colors',
                index === 0 && 'border-t border-white/5'
              )}
            >
              <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
                {activity.actorAvatar ? (
                  <Image
                    src={activity.actorAvatar}
                    alt={activity.actorName}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10"
                  />
                ) : (
                  <span className="text-sm font-mono text-white/40">{activity.actorName[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-sans">
                  <span className="text-white/70">{activity.actorName}</span>{' '}
                  {activity.action}
                </p>
                {activity.entityType && activity.entityId && (
                  <p className="text-xs text-white/30 font-mono mt-0.5">
                    {activity.entityType} · {activity.entityId.slice(0, 8)}
                  </p>
                )}
              </div>
              <span className="text-xs text-white/30 font-mono shrink-0">
                {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
