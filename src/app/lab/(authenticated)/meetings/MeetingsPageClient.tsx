'use client'

import { useState } from 'react'
import { Meeting, Project } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs, FilterTab } from '@/components/ui/FilterTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Video, Clock, Users, MapPin, CalendarDays } from 'lucide-react'
import { MeetingFormModal } from '@/components/lab/MeetingForm'
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

type MeetingWithProject = Omit<Meeting, 'project'> & {
  project?: Pick<Project, 'name'> | null
}

interface MeetingsPageProps {
  initialMeetings: MeetingWithProject[]
  initialProjects: { id: string; name: string }[]
}

export default function MeetingsPageClient({ initialMeetings, initialProjects }: MeetingsPageProps) {
  const [meetings] = useState(initialMeetings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [view, setView] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const router = useRouter()

  const now = new Date()

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = !projectFilter || meeting.project_id === projectFilter
    const meetingDate = new Date(meeting.scheduled_at)
    
    let matchesView = true
    if (view === 'upcoming') {
      matchesView = meetingDate >= now
    } else if (view === 'past') {
      matchesView = meetingDate < now
    }
    
    return matchesSearch && matchesProject && matchesView
  })

  const groupedMeetings = filteredMeetings.reduce((acc: Record<string, MeetingWithProject[]>, meeting) => {
    const date = new Date(meeting.scheduled_at).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(meeting)
    return acc
  }, {})

  function refreshMeetings() {
    router.refresh()
  }

  const viewTabs: FilterTab[] = [
    { id: 'upcoming', label: 'Upcoming', count: meetings.filter(m => new Date(m.scheduled_at) >= now).length },
    { id: 'past', label: 'Past', count: meetings.filter(m => new Date(m.scheduled_at) < now).length },
    { id: 'all', label: 'All', count: meetings.length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Meetings" 
        description="Schedule and manage your meetings"
        icon={CalendarDays}
        action={
          <LabButton onClick={() => setIsModalOpen(true)} data-tour="new-meeting">
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </LabButton>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search meetings..."
            className="max-w-xs"
          />
          {initialProjects.length > 0 && (
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-black">All Projects</option>
              {initialProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-black">{p.name}</option>
              ))}
            </select>
          )}
        </div>
        <FilterTabs 
          tabs={viewTabs} 
          activeTab={view} 
          onChange={(id) => setView(id as typeof view)} 
        />
      </div>

      {filteredMeetings.length === 0 ? (
        <EmptyState 
          icon={CalendarDays}
          title={searchQuery || view !== 'upcoming' ? 'No meetings found' : 'No meetings yet'}
          description={searchQuery || view !== 'upcoming' ? 'Try adjusting your search or filters' : 'Schedule a meeting to get started'}
          action={!searchQuery && view === 'upcoming' ? {
            label: 'Schedule Meeting',
            onClick: () => setIsModalOpen(true)
          } : undefined}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 font-sans">
                {date}
              </h2>
              <div className="space-y-3">
                {dateMeetings.map((meeting) => (
                  <Link 
                    key={meeting.id} 
                    href={`/lab/meetings/${meeting.id}`}
                    className="block bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">
                            {new Date(meeting.scheduled_at).getDate()}
                          </span>
                          <span className="text-[10px] text-accent/70 uppercase font-sans">
                            {new Date(meeting.scheduled_at).toLocaleString('en-US', { month: 'short' })}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white font-sans">
                            {meeting.title}
                          </h3>
                          {meeting.project && (
                            <p className="text-sm text-white/50 font-sans">
                              {(meeting.project as { name: string }).name}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-white/50 font-sans">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {format(new Date(meeting.scheduled_at), 'h:mm a')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {meeting.duration_minutes} min
                          </span>
                          {meeting.video_link && (
                            <a
                              href={meeting.video_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-accent hover:text-accent/80"
                            >
                              <Video className="w-4 h-4" />
                              Join
                            </a>
                          )}
                          {meeting.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {meeting.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MeetingFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refreshMeetings}
      />
    </div>
  )
}