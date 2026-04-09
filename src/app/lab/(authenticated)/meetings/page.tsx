import { createClient } from '@/lib/supabase/server'
import { Meeting, Project } from '@/types/lab'
import MeetingsPageClient from './MeetingsPageClient'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { meetingsTourSteps } from '@/components/onboarding/pageTours'

type MeetingWithProject = Omit<Meeting, 'project'> & {
  project?: Pick<Project, 'name'> | null
}

async function getMeetings(): Promise<MeetingWithProject[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('meetings')
    .select(`
      *,
      project:projects(name)
    `)
    .order('scheduled_at', { ascending: true })

  return (data || []) as MeetingWithProject[]
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name, status')
    .order('name', { ascending: true })
  
  return data || []
}

export default async function MeetingsPage() {
  const [meetings, projects] = await Promise.all([
    getMeetings(),
    getProjects()
  ])

  return (
    <>
      <TooltipTour steps={meetingsTourSteps} pageId="meetings" />
      <PageVisitTracker pageId="meetings" />
      <MeetingsPageClient initialMeetings={meetings} initialProjects={projects} />
    </>
  )
}