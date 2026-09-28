'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Settings, Users, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { assignUserToTeam, getAllTeams, getUserTeam } from '@/lib/actions/team-actions'
import {
  cancelInvite,
  getPendingInvites,
  getTeamMembers,
  inviteTeamMember,
  TeamInvite,
  updateMemberRole,
} from '@/lib/actions/settings-actions'
import { Team, UserRole } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TeamFormModal } from '@/components/lab/TeamForm'
import { TooltipTour, PageVisitTracker, teamsTourSteps } from '@/components/onboarding'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  job_title?: string | null
  team_id: string | null
  created_at: string
}

type TeamTab = 'teams' | 'moodboard' | 'members'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [view, setView] = useState<'all' | 'my'>('all')
  const [activeTab, setActiveTab] = useState<TeamTab>('teams')
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
    void loadData(true)
  }, [])

  async function loadData(showLoading = false) {
    if (showLoading) setLoading(true)

    const supabase = createClient()
    const [{ data: { user } }, allTeamsData] = await Promise.all([
      supabase.auth.getUser(),
      getAllTeams(),
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
        const [members, invites] = await Promise.all([getTeamMembers(), getPendingInvites()])
        setTeamMembers(members)
        setPendingInvites(invites)
      }
    }

    setTeams(allTeamsData)
    if (showLoading) setLoading(false)
  }

  const filteredTeams = useMemo(
    () => (view === 'my' && userTeam ? [userTeam] : teams),
    [teams, userTeam, view]
  )

  const teamMetrics = useMemo(() => {
    const totalMembers = isAdmin
      ? teamMembers.length
      : filteredTeams.reduce((sum, team) => sum + ((team as Team & { members?: { id: string }[] }).members?.length || 0), 0)

    return {
      totalTeams: teams.length,
      visibleTeams: filteredTeams.length,
      pendingInvites: pendingInvites.length,
      totalMembers,
    }
  }, [filteredTeams, isAdmin, pendingInvites.length, teamMembers.length, teams.length])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  async function handleInviteSubmit(event: React.FormEvent) {
    event.preventDefault()
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
      void loadData()
    } else {
      setInviteError(result.error || 'Failed to send invitation')
    }

    setInviteLoading(false)
  }

  async function handleCancelInvite(inviteId: string) {
    await cancelInvite(inviteId)
    void loadData()
  }

  async function handleUpdateMemberRole(memberId: string, role: string) {
    await updateMemberRole(memberId, role as UserRole)
    void loadData()
  }

  async function handleAssignTeam(memberId: string, teamId: string | null) {
    await assignUserToTeam(memberId, teamId)
    void loadData()
  }

  return (
    <>
      {!loading ? <TooltipTour steps={teamsTourSteps} pageId="teams" /> : null}
      <PageVisitTracker pageId="teams" />

      <div className="space-y-6">
        <section className="relative overflow-hidden border border-white/10 bg-[linear-gradient(155deg,rgba(0,229,255,0.08),rgba(0,0,0,0)_45%),#05090f]">
          <div className="border-b border-white/10 px-4 py-3">
            <LabPageHeader
              title="Teams"
              description="Team structure, members, and collaboration boards"
              icon={Users}
              action={
                isAdmin && activeTab === 'teams' ? (
                  <LabButton onClick={() => setShowCreateModal(true)} data-tour="new-team">
                    <Plus className="mr-2 h-4 w-4" />
                    New Team
                  </LabButton>
                ) : isAdmin && activeTab === 'members' ? (
                  <LabButton
                    onClick={() => {
                      setShowInviteModal(true)
                      setInviteError(null)
                      setInviteSuccess(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Invite
                  </LabButton>
                ) : undefined
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 sm:grid-cols-3">
            {([
              { key: 'teams', label: 'Teams' },
              { key: 'moodboard', label: 'Moodboard' },
              ...(isAdmin ? [{ key: 'members', label: 'Members' }] : []),
            ] as { key: TeamTab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-mono transition-colors',
                  activeTab === tab.key ? 'bg-accent/10 text-accent' : 'bg-black/55 text-white/60 hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <MetricStrip
          items={[
            { label: 'Teams', value: teamMetrics.totalTeams },
            { label: 'Visible Scope', value: teamMetrics.visibleTeams },
            { label: 'Members', value: teamMetrics.totalMembers },
            { label: 'Pending Invites', value: teamMetrics.pendingInvites, tone: teamMetrics.pendingInvites > 0 ? 'warning' : 'default' },
          ]}
        />

        {activeTab !== 'members' && isAdmin ? (
          <div className="inline-flex items-center gap-px border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => setView('all')}
              className={cn(
                'px-4 py-2 text-[10px] uppercase tracking-[0.13em] font-mono transition-colors',
                view === 'all' ? 'bg-accent/10 text-accent' : 'bg-black/50 text-white/60 hover:text-white'
              )}
            >
              All Teams
            </button>
            <button
              type="button"
              onClick={() => setView('my')}
              className={cn(
                'px-4 py-2 text-[10px] uppercase tracking-[0.13em] font-mono transition-colors',
                view === 'my' ? 'bg-accent/10 text-accent' : 'bg-black/50 text-white/60 hover:text-white'
              )}
            >
              My Team
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="border border-white/10 bg-black/45 px-4 py-10 text-center text-sm text-white/40 font-mono">
            Loading teams...
          </div>
        ) : activeTab === 'teams' ? (
          filteredTeams.length === 0 ? (
            <EmptyState
              icon={Users}
              title={view === 'my' ? 'You are not in a team yet' : 'No teams yet'}
              description={
                view === 'my'
                  ? 'Contact your administrator to be added to a team.'
                  : 'Create your first team to organize work.'
              }
              action={
                isAdmin && view === 'all'
                  ? { label: 'Create Team', onClick: () => setShowCreateModal(true) }
                  : undefined
              }
            />
          ) : (
            <PanelSection title="Team Directory" description="Open team workspace and admin settings">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTeams.map((team) => {
                  const memberCount =
                    (team as Team & { members?: { id: string }[] }).members?.length ??
                    teamMembers.filter((member) => member.team_id === team.id).length

                  return (
                    <Link
                      key={team.id}
                      href={`/lab/teams/${team.id}`}
                      className="group border border-white/10 bg-black/55 p-4 transition-colors hover:border-accent/35"
                      data-tour="team-card"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center border"
                            style={{
                              backgroundColor: team.color ? `${team.color}20` : '#00e5ff1a',
                              borderColor: team.color ? `${team.color}35` : '#00e5ff33',
                            }}
                          >
                            <span className="text-sm font-bold" style={{ color: team.color || '#00E5FF' }}>
                              {getInitials(team.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white group-hover:text-accent font-sans">{team.name}</p>
                            <p className="mt-1 truncate text-[11px] text-white/45 font-mono">
                              Lead: {team.lead?.full_name || 'Not assigned'}
                            </p>
                          </div>
                        </div>
                        <Settings className="h-4 w-4 text-white/30" />
                      </div>

                      {team.description ? (
                        <p className="mt-3 line-clamp-2 text-xs text-white/55 font-mono">{team.description}</p>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">
                        <span>{memberCount} members</span>
                        <span>Open</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </PanelSection>
          )
        ) : activeTab === 'moodboard' ? (
          filteredTeams.length === 0 ? (
            <EmptyState
              icon={Users}
              title={view === 'my' ? 'You are not in a team yet' : 'No teams yet'}
              description={
                view === 'my'
                  ? 'Contact your administrator to be added to a team.'
                  : 'Create your first team to start moodboards.'
              }
              action={
                isAdmin && view === 'all'
                  ? { label: 'Create Team', onClick: () => setShowCreateModal(true) }
                  : undefined
              }
            />
          ) : (
            <PanelSection title="Team Moodboards" description="Jump directly into creative boards for each team">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTeams.map((team) => {
                  const memberCount =
                    (team as Team & { members?: { id: string }[] }).members?.length ??
                    teamMembers.filter((member) => member.team_id === team.id).length

                  return (
                    <article key={team.id} className="border border-white/10 bg-black/55 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white font-sans">{team.name}</p>
                          <p className="mt-1 text-[11px] text-white/45 font-mono">Lead: {team.lead?.full_name || 'Not assigned'}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">{memberCount} members</span>
                      </div>

                      {team.description ? (
                        <p className="mt-3 line-clamp-2 text-xs text-white/55 font-mono">{team.description}</p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/lab/teams/${team.id}/moodboard`}
                          className="inline-flex items-center border border-accent/30 bg-accent/10 px-3 py-2 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                        >
                          Open Moodboard
                        </Link>
                        <Link
                          href={`/lab/teams/${team.id}`}
                          className="inline-flex items-center border border-white/15 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
                        >
                          Team Details
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </PanelSection>
          )
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <PanelSection title="Pending Invitations" description="Team invites that have not yet been accepted">
              {pendingInvites.length === 0 ? (
                <p className="text-sm text-white/45 font-mono">No pending invitations.</p>
              ) : (
                <div className="space-y-px border border-white/10 bg-white/5">
                  {pendingInvites.map((invite) => (
                    <article key={invite.id} className="flex items-center justify-between gap-3 bg-black/60 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white font-mono">{invite.email}</p>
                        <p className="mt-1 text-[11px] text-white/45 font-mono">
                          {invite.job_title || 'No job title'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleCancelInvite(invite.id)
                        }}
                        className="border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-rose-300 font-mono"
                      >
                        Cancel
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </PanelSection>

            <PanelSection title="Team Members" description="Role and team assignment controls">
              <div className="space-y-px border border-white/10 bg-white/5">
                {teamMembers.map((member) => (
                  <article key={member.id} className="grid gap-3 bg-black/60 px-4 py-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white font-mono">{member.full_name || member.email}</p>
                      <p className="mt-1 truncate text-[11px] text-white/45 font-mono">
                        {member.job_title ? `${member.job_title} · ` : ''}
                        {member.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <select
                        value={member.role}
                        onChange={(event) => {
                          void handleUpdateMemberRole(member.id, event.target.value)
                        }}
                        className="border border-white/10 bg-black/70 px-2.5 py-2 text-xs text-white"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="client">Client</option>
                      </select>

                      <select
                        value={member.team_id || ''}
                        onChange={(event) => {
                          void handleAssignTeam(member.id, event.target.value || null)
                        }}
                        className="border border-white/10 bg-black/70 px-2.5 py-2 text-xs text-white"
                      >
                        <option value="">No Team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </PanelSection>
          </div>
        )}

        {showCreateModal ? (
          <TeamFormModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              void loadData(false)
            }}
          />
        ) : null}

        {showInviteModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowInviteModal(false)} />
            <div className="relative w-full max-w-md border border-white/10 bg-[#060a0f]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-white/75 font-mono">Invite Team Member</p>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="border border-white/15 bg-white/5 p-1 text-white/50 transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4 p-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  required
                  className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Job title (optional)"
                  value={inviteJobTitle}
                  onChange={(event) => setInviteJobTitle(event.target.value)}
                  className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                />

                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as 'member' | 'admin' | 'client')}
                  className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                </select>

                {inviteError ? <p className="text-sm text-rose-300 font-mono">{inviteError}</p> : null}
                {inviteSuccess ? <p className="text-sm text-emerald-300 font-mono">Invitation sent.</p> : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <LabButton type="button" variant="ghost" onClick={() => setShowInviteModal(false)} className="flex-1">
                    Cancel
                  </LabButton>
                  <LabButton type="submit" disabled={inviteLoading} className="flex-1">
                    {inviteLoading ? 'Sending...' : 'Send Invite'}
                  </LabButton>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
