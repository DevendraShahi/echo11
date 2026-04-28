import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays, Clock, Video, MapPin, ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'

interface MeetingRecord {
  id: string
  title: string
  description: string | null
  project_id: string | null
  scheduled_at: string
  duration_minutes: number
  video_link: string | null
  location: string | null
}

interface ClientMeeting extends MeetingRecord {
  projectName: string | null
}

async function getClientMeetings(clientId: string): Promise<ClientMeeting[]> {
  const supabase = await createClient()

  const { data: clientProjects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('client_id', clientId)

  if (!clientProjects || clientProjects.length === 0) return []

  const projectIds = clientProjects.map((project) => project.id)
  const projectNameById = new Map(clientProjects.map((project) => [project.id, project.name]))

  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, description, project_id, scheduled_at, duration_minutes, video_link, location')
    .in('project_id', projectIds)
    .order('scheduled_at', { ascending: true })

  return (meetings || []).map((meeting) => ({
    ...(meeting as MeetingRecord),
    projectName: meeting.project_id ? projectNameById.get(meeting.project_id) || null : null,
  }))
}

export default async function ClientMeetingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/client/auth/login')
  }

  const { data: viewerClient } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  const meetings = viewerClient ? await getClientMeetings(viewerClient.id) : []
  const now = new Date()
  const upcomingMeetings = meetings.filter((meeting) => new Date(meeting.scheduled_at) >= now)
  const pastMeetings = meetings.filter((meeting) => new Date(meeting.scheduled_at) < now).reverse()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white font-sans">Meetings</h1>
        <p className="text-white/50 mt-1">Track upcoming calls and review past sessions.</p>
      </div>

      {meetings.length === 0 ? (
        <div className="p-12 bg-white/5 border border-white/10 text-center">
          <div className="w-16 h-16 bg-white/5 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">No meetings scheduled yet</h2>
          <p className="text-white/40">Meetings tied to your projects will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-3">Upcoming</h2>
            {upcomingMeetings.length === 0 ? (
              <div className="p-5 bg-white/5 border border-white/10 text-white/40 text-sm">
                No upcoming meetings.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <article key={meeting.id} className="p-5 bg-white/5 border border-white/10">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{meeting.title}</h3>
                        {meeting.projectName && (
                          <p className="text-accent/90 text-sm font-mono mt-1">{meeting.projectName}</p>
                        )}
                        {meeting.description && (
                          <p className="text-white/60 text-sm mt-2 max-w-2xl">{meeting.description}</p>
                        )}
                      </div>
                      <div className="text-white/70 text-sm font-mono">
                        {format(new Date(meeting.scheduled_at), 'MMM d, yyyy • h:mm a')}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {meeting.duration_minutes} min
                      </span>
                      {meeting.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                      )}
                      {meeting.video_link && (
                        <a
                          href={meeting.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80"
                        >
                          <Video className="w-4 h-4" />
                          Join call
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-3">Past</h2>
            {pastMeetings.length === 0 ? (
              <div className="p-5 bg-white/5 border border-white/10 text-white/40 text-sm">
                No past meetings.
              </div>
            ) : (
              <div className="space-y-3">
                {pastMeetings.slice(0, 8).map((meeting) => (
                  <article key={meeting.id} className="p-5 bg-black/40 border border-white/10">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-white font-medium">{meeting.title}</p>
                        {meeting.projectName && (
                          <p className="text-white/40 text-xs font-mono mt-1">{meeting.projectName}</p>
                        )}
                      </div>
                      <p className="text-white/40 text-sm font-mono">
                        {format(new Date(meeting.scheduled_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
