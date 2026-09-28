import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/lab'
import { ProjectList } from '@/components/lab/unified/ProjectList'
import { LabButton } from '@/components/ui/LabButton'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getClientProjects(clientId: string): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, tasks:tasks(status, priority)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    
  return data as Project[] || []
}

async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { canEdit: false }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') return { canEdit: true }
  
  const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', user.id)
  return { canEdit: (count ?? 0) > 0 }
}

export default async function ClientProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [projects, { canEdit }] = await Promise.all([
    getClientProjects(id),
    getUserRole()
  ])

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Link href={`/lab/projects/new?client=${id}`}>
            <LabButton className="font-mono text-xs uppercase tracking-wider">
              <Plus className="w-3 h-3 mr-2" />Add Project
            </LabButton>
          </Link>
        </div>
      )}
      
      <ProjectList projects={projects} showClient={false} />
    </div>
  )
}
