import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FolderKanban } from 'lucide-react'
import { ClientCard } from '@/components/client/ui/ClientCard'
import { ClientProjectsGrid } from '@/components/client/ui/ClientProjectsGrid'
import { ClientSectionHeader } from '@/components/client/ui/ClientSectionHeader'

interface ProjectRecord {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  color: string
  deadline: string | null
  start_date: string | null
  created_at: string | null
}

async function getClientProjects(clientId: string): Promise<ProjectRecord[]> {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, status, progress, color, deadline, start_date, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return (projects || []) as ProjectRecord[]
}

export default async function ClientProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/client/auth/login')
  }

  const { data: viewerClient } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  const projects = viewerClient ? await getClientProjects(viewerClient.id) : []

  return (
    <div className="space-y-6">
      <ClientSectionHeader title="Your Projects" description="View and track all your projects." />

      {projects.length === 0 ? (
        <ClientCard className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-white/5">
            <FolderKanban className="h-8 w-8 text-white/30" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">No projects yet</h3>
          <p className="text-white/40">Your projects will appear here once echo11 starts working on them.</p>
        </ClientCard>
      ) : (
        <ClientProjectsGrid projects={projects} basePath="/client/projects" showStatusFilter showSortControl />
      )}
    </div>
  )
}
