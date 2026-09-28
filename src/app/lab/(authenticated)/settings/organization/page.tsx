import { OrganizationPageClient } from './OrganizationPageClient'
import { getAllTeams, getUserRoleAndTeam } from '@/lib/actions/team-actions'

export default async function OrganizationPage() {
  const [teams, userRole] = await Promise.all([
    getAllTeams(),
    getUserRoleAndTeam()
  ])

  return <OrganizationPageClient initialTeams={teams} isAdmin={userRole?.isAdmin || false} />
}
