'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAllTeams, getUserTeam, assignUserToTeam } from '@/lib/actions/team-actions'
import { getTeamMembers, updateMemberRole, getPendingInvites, inviteTeamMember, cancelInvite, TeamInvite } from '@/lib/actions/settings-actions'
import { Team, UserRole } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Settings, Mail, X, Users } from 'lucide-react'
import Link from 'next/link'
import { TeamFormModal } from '@/components/lab/TeamForm'
import { TooltipTour, PageVisitTracker, teamsTourSteps } from '@/components/onboarding'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  job_title?: string | null
  team_id: string | null
  created_at: string
}



export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [view, setView] = useState<'all' | 'my'>('all')
  const [activeTab, setActiveTab] = useState<'teams' | 'moodboard' | 'members'>('teams')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'client'>('member')
  const [inviteJobTitle, setInviteJobTitle] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    loadData(true)
  }, [])

  async function loadData(showLoading = false) {
    if (showLoading) setLoading(true)
    const supabase = createClient()
    
    const [{ data: { user } }, allTeamsData] = await Promise.all([
      supabase.auth.getUser(),
      getAllTeams()
    ])

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, team_id')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')

      if (profile?.team_id) {
        const myTeam = await getUserTeam(user.id)
        setUserTeam(myTeam)
      }

      if (profile?.role === 'admin') {
        const members = await getTeamMembers()
        setTeamMembers(members)
        
        const invites = await getPendingInvites()
        setPendingInvites(invites)
      }
    }

    setTeams(allTeamsData)
    if (showLoading) setLoading(false)
  }

  const filteredTeams = view === 'my' && userTeam 
    ? [userTeam].filter(Boolean) 
    : teams

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    
    const result = await inviteTeamMember(inviteEmail, inviteRole, inviteJobTitle || undefined)

    if (result.success) {
      setInviteError(null)
      setInviteSuccess(true)
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteSuccess(false)
        setInviteEmail('')
        setInviteRole('member')
        setInviteJobTitle('')
      }, 1200)
      loadData()
    } else {
      setInviteError(result.error || 'Failed to send invitation')
    }
    
    setInviteLoading(false)
  }

  async function handleCancelInvite(inviteId: string) {
    await cancelInvite(inviteId)
    loadData()
  }

  async function handleUpdateMemberRole(memberId: string, role: string) {
    await updateMemberRole(memberId, role as UserRole)
    loadData()
  }

  async function handleAssignTeam(memberId: string, teamId: string | null) {
    await assignUserToTeam(memberId, teamId)
    loadData()
  }

  return (
    <>
      {!loading && <TooltipTour steps={teamsTourSteps} pageId="teams" />}
      <PageVisitTracker pageId="teams" />
    
      <div className="space-y-6">
        <PageHeader 
          title="Teams" 
          description="Manage your teams and team members"
          icon={Users}
          action={
            isAdmin && activeTab === 'teams' ? (
              <LabButton onClick={() => setShowCreateModal(true)} data-tour="new-team">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </LabButton>
            ) : isAdmin && activeTab === 'members' ? (
              <LabButton onClick={() => { setShowInviteModal(true); setInviteError(null); setInviteSuccess(false) }}>
                <Plus className="w-4 h-4 mr-2" />
                Invite
              </LabButton>
            ) : undefined
          }
        />

        <div className="flex border-b border-white/10 mt-2 mb-6">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'teams' 
                ? 'border-accent text-accent' 
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('moodboard')}
            className={`px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'moodboard'
                ? 'border-accent text-accent'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Moodboard
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'members' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Team Members
            </button>
          )}
        </div>

        {activeTab === 'teams' && isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors ${
                view === 'all' 
                  ? 'bg-accent text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Teams
            </button>
            <button
              onClick={() => setView('my')}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors ${
                view === 'my' 
                  ? 'bg-accent text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              My Team
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-white/30 font-mono">Loading...</div>
        ) : activeTab === 'teams' ? (
          filteredTeams.length === 0 ? (
            <EmptyState 
              icon={Users}
              title={view === 'my' ? 'You are not in a team yet' : 'No teams yet'}
              description={view === 'my' 
                ? 'Contact your administrator to be added to a team' 
                : 'Create your first team to get started'
              }
              action={isAdmin && view === 'all' ? {
                label: 'Create Team',
                onClick: () => setShowCreateModal(true)
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <Link 
                  key={team.id}
                  href={`/lab/teams/${team.id}`}
                  className="block p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  data-tour="team-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: team.color ? `${team.color}20` : '#6366f120' }}
                    >
                      <span 
                        className="text-lg font-bold"
                        style={{ color: team.color || '#6366f1' }}
                      >
                        {getInitials(team.name)}
                      </span>
                    </div>
                    <Settings className="w-4 h-4 text-white/30" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white font-sans mb-1">
                    {team.name}
                  </h3>
                  
                  {team.description && (
                    <p className="text-sm text-white/50 font-mono mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                    <span>{team.lead?.full_name || 'No lead'}</span>
                    <span>{(team as Team & { members?: { id: string }[] }).members?.length ?? teamMembers.filter(m => m.team_id === team.id).length} members</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'moodboard' ? (
          filteredTeams.length === 0 ? (
            <EmptyState 
              icon={Users}
              title={view === 'my' ? 'You are not in a team yet' : 'No teams yet'}
              description={view === 'my' 
                ? 'Contact your administrator to be added to a team' 
                : 'Create your first team to get started'
              }
              action={isAdmin && view === 'all' ? {
                label: 'Create Team',
                onClick: () => setShowCreateModal(true)
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div 
                  key={team.id}
                  className="p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
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
                        <h3 className="text-lg font-semibold text-white font-sans">{team.name}</h3>
                        <p className="text-xs text-white/40 font-mono">Lead: {team.lead?.full_name || 'No lead set'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 font-mono">{(team as Team & { members?: { id: string }[] }).members?.length ?? teamMembers.filter(m => m.team_id === team.id).length} members</span>
                  </div>

                  {team.description && (
                    <p className="text-sm text-white/60 font-mono line-clamp-2">{team.description}</p>
                  )}

                  <div className="flex gap-2">
                    <Link 
                      href={`/lab/teams/${team.id}/moodboard`}
                      className="flex-1 text-center px-4 py-2 bg-accent text-black font-mono text-xs uppercase tracking-wider hover:opacity-90"
                    >
                      Open Moodboard
                    </Link>
                    <Link
                      href={`/lab/teams/${team.id}`}
                      className="px-4 py-2 border border-white/15 text-white/80 font-mono text-xs uppercase tracking-wider hover:border-white/30"
                    >
                      Team Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6 max-w-4xl">
            {pendingInvites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Pending Invitations</p>
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-white/40" />
                      <div>
                        <p className="text-sm text-white/70 font-mono">{invite.email}</p>
                        {invite.job_title && <p className="text-xs text-white/40 font-mono mt-0.5">{invite.job_title}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Team Members</p>
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm text-white font-mono">{member.full_name || member.email}</p>
                    <p className="text-xs text-white/40 font-mono">
                      {member.job_title ? `${member.job_title} • ` : ''}{member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                      className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-accent focus:outline-none"
                    >
                      <option value="member" className="bg-black">Member</option>
                      <option value="admin" className="bg-black">Admin</option>
                      <option value="client" className="bg-black">Client</option>
                    </select>
                    <select
                      value={member.team_id || ''}
                      onChange={(e) => handleAssignTeam(member.id, e.target.value || null)}
                      className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-accent focus:outline-none"
                    >
                      <option value="" className="bg-black">No Team</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {showCreateModal && (
        <TeamFormModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => loadData(false)}
        />
      )}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowInviteModal(false)} />
          <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="p-4 space-y-4">
              <input 
                type="email" 
                placeholder="Email address *" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" 
              />
              <input 
                type="text" 
                placeholder="Job Title (optional)" 
                value={inviteJobTitle}
                onChange={e => setInviteJobTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" 
              />
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as 'member' | 'admin' | 'client')}
                className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none"
              >
                <option value="member" className="bg-black">Member</option>
                <option value="admin" className="bg-black">Admin</option>
                <option value="client" className="bg-black">Client</option>
              </select>
              {inviteError && (
                <p className="text-sm text-rose-400 font-mono">{inviteError}</p>
              )}
              {inviteSuccess && (
                <p className="text-sm text-emerald-400 font-mono">Invitation sent successfully!</p>
              )}
              <div className="flex gap-2 pt-2">
                <LabButton type="button" variant="ghost" onClick={() => setShowInviteModal(false)} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
                <LabButton type="submit" disabled={inviteLoading} className="flex-1 font-mono text-xs uppercase tracking-wider">
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </LabButton>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
