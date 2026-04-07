'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getTeam, getTeamMembers, assignUserToTeam, removeUserFromTeam, setTeamLead, assignProjectToTeam, removeProjectFromTeam } from '@/lib/actions/team-actions'
import { Team, Profile, Project } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArrowLeft, Users, FolderKanban, Building2, Plus, X, Trash2, UserPlus, Crown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProjectWithClient {
  id: string
  name: string
  status: string
  client?: { id: string; company_name: string } | null
}

interface ProfileSelect {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  team_id: string | null
  avatar_url?: string | null
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Profile[]>([])
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLead, setIsLead] = useState(false)
  const [allProfiles, setAllProfiles] = useState<ProfileSelect[]>([])
  const [allProjects, setAllProjects] = useState<ProjectWithClient[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)

  useEffect(() => {
    loadData()
  }, [teamId])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    
    const [{ data: { user } }, teamData] = await Promise.all([
      supabase.auth.getUser(),
      getTeam(teamId)
    ])

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, team_id')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
      setIsLead(profile?.team_id === teamId && teamData?.lead_id === user.id)
    }

    if (teamData) {
      setTeam(teamData)
      setMembers(teamData.members || [])
      setProjects(teamData.projects || [])
    }

    // Get all profiles not in this team for adding members
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, team_id')
      .neq('team_id', teamId)
      .order('full_name', { ascending: true })
    setAllProfiles(profiles || [])

    // Get all projects not assigned to this team
    const { data: projData } = await supabase
      .from('projects')
      .select('id, name, status, client:clients(id, company_name)')
      .neq('team_id', teamId)
      .order('name', { ascending: true })
    
    const mappedProjects = (projData || []).map((p: { id: string; name: string; status: string; client: { id: string; company_name: string }[] }) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      client: p.client?.[0] || null
    }))
    setAllProjects(mappedProjects)

    setLoading(false)
  }

  async function handleAddMember(profileId: string) {
    const result = await assignUserToTeam(profileId, teamId)
    if (result.success) {
      loadData()
      setShowAddMember(false)
    } else {
      alert(result.error)
    }
  }

  async function handleRemoveMember(profileId: string) {
    if (!confirm('Remove this member from the team?')) return
    const result = await removeUserFromTeam(profileId)
    if (result.success) {
      loadData()
    }
  }

  async function handleSetLead(profileId: string) {
    const result = await setTeamLead(teamId, profileId)
    if (result.success) {
      loadData()
    }
  }

  async function handleAddProject(projectId: string) {
    const result = await assignProjectToTeam(projectId, teamId)
    if (result.success) {
      loadData()
      setShowAddProject(false)
    }
  }

  async function handleRemoveProject(projectId: string) {
    if (!confirm('Remove this project from the team?')) return
    const result = await removeProjectFromTeam(projectId)
    if (result.success) {
      loadData()
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/30 font-mono">Loading...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/lab/teams" className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">Team not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lab/teams" className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: team.color ? `${team.color}20` : '#6366f120' }}
              >
                <span 
                  className="text-lg font-bold"
                  style={{ color: team.color || '#6366f1' }}
                >
                  {getInitials(team.name)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-sans">{team.name}</h1>
                {team.description && (
                  <p className="text-sm text-white/50 font-mono">{team.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <LabCard>
            <LabCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Team Members</LabCardTitle>
                </div>
                {(isAdmin || isLead) && (
                  <LabButton variant="ghost" onClick={() => setShowAddMember(true)} className="font-mono text-xs uppercase">
                    <UserPlus className="w-3 h-3 mr-2" />Add
                  </LabButton>
                )}
              </div>
            </LabCardHeader>
            <LabCardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-white/30 font-mono text-sm">No members yet</div>
              ) : (
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full">
                          <span className="text-sm font-mono text-white/70">{getInitials(member.full_name)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-sans">{member.full_name || 'No name'}</p>
                            {team.lead_id === member.id && (
                              <Crown className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                          <p className="text-xs text-white/40 font-mono">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && team.lead_id !== member.id && (
                          <>
                            <button 
                              onClick={() => handleSetLead(member.id)}
                              className="p-2 text-white/40 hover:text-amber-400 transition-colors"
                              title="Set as lead"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-white/40 hover:text-rose-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </LabCard>
        </div>

        {/* Team Info */}
        <div>
          <LabCard>
            <LabCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Team Lead</LabCardTitle>
              </div>
            </LabCardHeader>
            <LabCardContent>
              {team.lead ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full">
                    <span className="text-sm font-mono text-white/70">{getInitials(team.lead.full_name)}</span>
                  </div>
                  <p className="text-sm text-white font-sans">{team.lead.full_name || 'No name'}</p>
                </div>
              ) : (
                <p className="text-sm text-white/40 font-mono">No lead assigned</p>
              )}
            </LabCardContent>
          </LabCard>
        </div>
      </div>

      {/* Team Projects */}
      <LabCard>
        <LabCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-accent" />
              </div>
              <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Team Projects</LabCardTitle>
            </div>
            {(isAdmin || isLead) && (
              <LabButton variant="ghost" onClick={() => setShowAddProject(true)} className="font-mono text-xs uppercase">
                <Plus className="w-3 h-3 mr-2" />Add
              </LabButton>
            )}
          </div>
        </LabCardHeader>
        <LabCardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-white/30 font-mono text-sm">No projects assigned to this team yet</div>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                  <Link href={`/lab/projects/${project.id}`} className="flex items-center gap-3 hover:text-accent transition-colors">
                    <FolderKanban className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-sm text-white font-sans">{project.name}</p>
                      {project.client && (
                        <p className="text-xs text-white/40 font-mono">{project.client.company_name}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-mono uppercase tracking-wider border",
                      project.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40"
                    )}>
                      {project.status}
                    </span>
                    {(isAdmin || isLead) && (
                      <button 
                        onClick={() => handleRemoveProject(project.id)}
                        className="p-2 text-white/40 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </LabCardContent>
      </LabCard>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddMember(false)} />
          <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Add Team Member</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {allProfiles.length === 0 ? (
                <p className="text-center text-white/30 font-mono text-sm py-4">No available users to add</p>
              ) : (
                <div className="space-y-2">
                  {allProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => handleAddMember(profile.id)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm text-white font-sans">{profile.full_name || 'No name'}</p>
                        <p className="text-xs text-white/40 font-mono">{profile.email}</p>
                      </div>
                      <Plus className="w-4 h-4 text-white/40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddProject(false)} />
          <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Add Project to Team</h3>
              <button onClick={() => setShowAddProject(false)} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {allProjects.length === 0 ? (
                <p className="text-center text-white/30 font-mono text-sm py-4">No available projects to add</p>
              ) : (
                <div className="space-y-2">
                  {allProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleAddProject(project.id)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm text-white font-sans">{project.name}</p>
                        {'client' in project && project.client && (
                          <p className="text-xs text-white/40 font-mono">{(project as ProjectWithClient).client?.company_name}</p>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-white/40" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
