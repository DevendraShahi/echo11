'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAllTeams, getUserTeam } from '@/lib/actions/team-actions'
import { Team } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { TeamFormModal } from '@/components/lab/TeamForm'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { teamsTourSteps } from '@/components/onboarding/pageTours'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [view, setView] = useState<'all' | 'my'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
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
    }

    setTeams(allTeamsData)
    setLoading(false)
  }

  const filteredTeams = view === 'my' && userTeam 
    ? [userTeam].filter(Boolean) 
    : teams

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
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
            isAdmin && (
              <LabButton onClick={() => setShowCreateModal(true)} data-tour="new-team">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </LabButton>
            )
          }
        />

      {isAdmin && (
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
      ) : filteredTeams.length === 0 ? (
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
                <span>{team.members?.length || 0} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <TeamFormModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={loadData}
        />
      )}
    </div>
    </>
  )
}