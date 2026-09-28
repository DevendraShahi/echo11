'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/lab/patterns/Section'
import { LabButton } from '@/components/ui/LabButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Team } from '@/types/lab'
import { Users, Plus, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { TeamFormModal } from '@/components/lab/TeamForm'

interface OrganizationPageClientProps {
  initialTeams: Team[]
  isAdmin: boolean
}

export function OrganizationPageClient({ initialTeams, isAdmin }: OrganizationPageClientProps) {
  const [teams] = useState(initialTeams)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        description="Teams, members, and workspace management"
        icon={Users}
        action={isAdmin ? (
          <LabButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </LabButton>
        ) : undefined}
      />

      <Section title="Teams" count={teams.length}>
        {teams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams yet"
            description={isAdmin ? 'Create your first team to get started' : 'No teams available'}
            action={isAdmin ? { label: 'Create Team', onClick: () => setShowCreateModal(true) } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Link key={team.id} href={`/lab/settings/organization/${team.id}`} className="block p-4 bg-white/5 border border-white/10 hover:border-accent/20 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: team.color ? `${team.color}20` : '#6366f120' }}
                    >
                      <span className="text-sm font-bold font-mono" style={{ color: team.color || '#6366f1' }}>
                        {getInitials(team.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-sans group-hover:text-accent transition-colors">{team.name}</p>
                      {team.description && <p className="text-xs text-white/40 font-mono truncate max-w-[180px]">{team.description}</p>}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-accent transition-colors" />
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-white/30 font-mono">{team.members?.length || 0} members</span>
                  </div>
                  {team.lead && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-white/30 font-mono">{team.lead.full_name || 'Lead'}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <TeamFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />
    </div>
  )
}
