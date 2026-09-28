import { createClient } from '@/lib/supabase/server'

export type LabPermissions = {
  project: {
    create: boolean
    update: boolean
    delete: boolean
    assignTeam: boolean
    manageTags: boolean
  }
  task: {
    create: boolean
    update: boolean
    delete: boolean
    markDone: boolean
    assign: boolean
  }
  client: {
    create: boolean
    update: boolean
    delete: boolean
    invitePortal: boolean
    viewFinancials: boolean
  }
  finance: {
    view: boolean
    createInvoice: boolean
    sendInvoice: boolean
    markPaid: boolean
    deleteInvoice: boolean
  }
  contract: {
    create: boolean
    update: boolean
    delete: boolean
    send: boolean
  }
  meeting: {
    create: boolean
    update: boolean
    delete: boolean
  }
  team: {
    create: boolean
    invite: boolean
    removeMember: boolean
    setLead: boolean
  }
  system: {
    viewHealth: boolean
    viewAudit: boolean
    viewEvents: boolean
  }
  settings: {
    updateProfile: boolean
    changePassword: boolean
    updatePreferences: boolean
  }
}

interface AgencyScope {
  userId: string
  role: string
  teamId: string | null
  isAdmin: boolean
  isLead: boolean
}

async function getAgencyScope(): Promise<AgencyScope | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  let isLead = false
  if (profile.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', profile.team_id)
      .eq('lead_id', user.id)
      .single()
    isLead = Boolean(team)
  }

  return {
    userId: user.id,
    role: profile.role,
    teamId: profile.team_id,
    isAdmin: profile.role === 'admin',
    isLead,
  }
}

export async function resolvePermissions(): Promise<LabPermissions> {
  const scope = await getAgencyScope()

  if (!scope) {
    return getDefaultPermissions(false, false)
  }

  return getDefaultPermissions(scope.isAdmin, scope.isLead)
}

function getDefaultPermissions(isAdmin: boolean, isLead: boolean): LabPermissions {
  const canManage = isAdmin || isLead

  return {
    project: {
      create: canManage,
      update: canManage,
      delete: isAdmin,
      assignTeam: canManage,
      manageTags: canManage,
    },
    task: {
      create: canManage,
      update: canManage,
      delete: canManage,
      markDone: true,
      assign: canManage,
    },
    client: {
      create: canManage,
      update: canManage,
      delete: isAdmin,
      invitePortal: canManage,
      viewFinancials: isAdmin,
    },
    finance: {
      view: canManage,
      createInvoice: canManage,
      sendInvoice: canManage,
      markPaid: canManage,
      deleteInvoice: isAdmin,
    },
    contract: {
      create: canManage,
      update: canManage,
      delete: canManage,
      send: canManage,
    },
    meeting: {
      create: true,
      update: canManage,
      delete: canManage,
    },
    team: {
      create: isAdmin,
      invite: isAdmin,
      removeMember: isAdmin,
      setLead: isAdmin,
    },
    system: {
      viewHealth: isAdmin,
      viewAudit: isAdmin,
      viewEvents: isAdmin,
    },
    settings: {
      updateProfile: true,
      changePassword: true,
      updatePreferences: true,
    },
  }
}

export async function getUserRoleAndTeam(): Promise<{
  userId: string | null
  role: string | null
  teamId: string | null
  isAdmin: boolean
  isLead: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { userId: null, role: null, teamId: null, isAdmin: false, isLead: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { userId: user.id, role: null, teamId: null, isAdmin: false, isLead: false }
  }

  let isLead = false
  if (profile.team_id) {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', profile.team_id)
      .eq('lead_id', user.id)
      .single()
    isLead = Boolean(team)
  }

  return {
    userId: user.id,
    role: profile.role,
    teamId: profile.team_id,
    isAdmin: profile.role === 'admin',
    isLead,
  }
}
