#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const FOUNDATION_MIGRATION = path.join(
  ROOT,
  'supabase/migrations/20260520000000_unified_architecture_foundation.sql'
)

const ROLE_ORDER = ['admin', 'lead', 'member', 'client']

const POLICY_MATRIX = [
  { fn: 'can_read_team', arg: 'check_team_id', expected: { admin: true, lead: true, member: true, client: false } },
  { fn: 'can_manage_team', arg: 'check_team_id', expected: { admin: true, lead: true, member: false, client: false } },
  { fn: 'can_read_project', arg: 'check_project_id', expected: { admin: true, lead: true, member: true, client: false } },
  { fn: 'can_manage_project', arg: 'check_project_id', expected: { admin: true, lead: true, member: false, client: false } },
  { fn: 'can_read_task', arg: 'check_task_id', expected: { admin: true, lead: true, member: true, client: false } },
  { fn: 'can_manage_task', arg: 'check_task_id', expected: { admin: true, lead: true, member: true, client: false } },
  { fn: 'can_read_client', arg: 'check_client_id', expected: { admin: true, lead: true, member: true, client: true } },
  { fn: 'can_manage_client', arg: 'check_client_id', expected: { admin: true, lead: true, member: false, client: false } },
]

function loadDotEnvLocal() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function parseFlag(flag) {
  return process.argv.includes(flag)
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return false
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return ['true', 't', '1'].includes(value.toLowerCase())
  return Boolean(value)
}

function assertInSql(sql, pattern, label, errors) {
  if (!pattern.test(sql)) {
    errors.push(`Missing in migration: ${label}`)
  }
}

function runStaticPolicyCoverageCheck() {
  const errors = []

  if (!fs.existsSync(FOUNDATION_MIGRATION)) {
    return {
      ok: false,
      errors: [`Missing migration file: ${FOUNDATION_MIGRATION}`],
    }
  }

  const sql = fs.readFileSync(FOUNDATION_MIGRATION, 'utf8')

  const requiredFunctions = [
    'can_read_team',
    'can_manage_team',
    'can_read_project',
    'can_manage_project',
    'can_read_task',
    'can_manage_task',
    'can_read_client',
    'can_manage_client',
  ]

  for (const fn of requiredFunctions) {
    assertInSql(
      sql,
      new RegExp(`CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${fn}\\s*\\(`, 'i'),
      `function public.${fn}(...)`,
      errors
    )
    assertInSql(
      sql,
      new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${fn}\\(uuid\\)\\s+TO\\s+authenticated;`, 'i'),
      `grant execute on public.${fn}(uuid)`,
      errors
    )
  }

  const requiredPolicySnippets = [
    'CREATE POLICY "Team scoped read memberships" ON public.team_memberships',
    'CREATE POLICY "Team managers can manage memberships" ON public.team_memberships',
    'CREATE POLICY "Client scoped read memberships" ON public.client_memberships',
    'CREATE POLICY "Client managers can manage memberships" ON public.client_memberships',
    'CREATE POLICY "Scoped client dashboard projection read" ON public.client_dashboard_projection',
    'CREATE POLICY "Scoped team workload projection read" ON public.team_workload_projection',
    'CREATE POLICY "Users read own unread projection" ON public.unread_counts_projection',
    'CREATE POLICY "Org members read activity projection" ON public.activity_projection',
  ]

  for (const snippet of requiredPolicySnippets) {
    if (!sql.includes(snippet)) {
      errors.push(`Missing in migration: ${snippet}`)
    }
  }

  return { ok: errors.length === 0, errors }
}

function requireEnv(key) {
  const value = process.env[key]
  if (!value || !value.trim()) {
    throw new Error(`Missing required env: ${key}`)
  }
  return value
}

async function createAuthUser(admin, label, email, password, runId) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { policy_matrix_run: runId, role: label },
  })

  if (error || !data?.user) {
    throw new Error(`Failed to create ${label} user: ${error?.message || 'unknown error'}`)
  }

  return data.user.id
}

async function signInUser(url, anonKey, email, password, label) {
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`Failed to sign in ${label}: ${error.message}`)
  }

  return client
}

async function runLivePolicyMatrix() {
  loadDotEnvLocal()

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const password = `Echo11!${Math.random().toString(36).slice(2, 12)}A1`
  const mkEmail = (role) => `policy-matrix-${role}-${runId}@example.com`

  const createdUserIds = []
  const cleanup = {
    taskId: null,
    projectId: null,
    clientId: null,
    teamId: null,
    organizationId: null,
  }

  try {
    const userIds = {
      admin: await createAuthUser(admin, 'admin', mkEmail('admin'), password, runId),
      lead: await createAuthUser(admin, 'lead', mkEmail('lead'), password, runId),
      member: await createAuthUser(admin, 'member', mkEmail('member'), password, runId),
      client: await createAuthUser(admin, 'client', mkEmail('client'), password, runId),
    }

    createdUserIds.push(userIds.admin, userIds.lead, userIds.member, userIds.client)

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: `Policy Matrix Org ${runId}`,
        slug: `policy-matrix-org-${runId}`,
      })
      .select('id')
      .single()
    if (orgError || !org) throw new Error(`Failed to create organization: ${orgError?.message || 'unknown error'}`)
    cleanup.organizationId = org.id

    const { data: team, error: teamError } = await admin
      .from('teams')
      .insert({
        name: `Policy Matrix Team ${runId}`,
        description: 'Policy matrix fixture',
        color: '#00E5FF',
        lead_id: userIds.lead,
        organization_id: org.id,
      })
      .select('id')
      .single()
    if (teamError || !team) throw new Error(`Failed to create team: ${teamError?.message || 'unknown error'}`)
    cleanup.teamId = team.id

    const { data: clientRow, error: clientError } = await admin
      .from('clients')
      .insert({
        company_name: `Policy Matrix Client ${runId}`,
        contact_name: 'Policy Client',
        email: `policy-client-${runId}@example.com`,
        auth_id: userIds.client,
        created_by: userIds.admin,
        organization_id: org.id,
      })
      .select('id')
      .single()
    if (clientError || !clientRow) throw new Error(`Failed to create client: ${clientError?.message || 'unknown error'}`)
    cleanup.clientId = clientRow.id

    const { data: project, error: projectError } = await admin
      .from('projects')
      .insert({
        name: `Policy Matrix Project ${runId}`,
        client_id: clientRow.id,
        team_id: team.id,
        status: 'active',
        type: 'other',
        progress: 0,
        created_by: userIds.admin,
        organization_id: org.id,
      })
      .select('id')
      .single()
    if (projectError || !project) throw new Error(`Failed to create project: ${projectError?.message || 'unknown error'}`)
    cleanup.projectId = project.id

    const { data: task, error: taskError } = await admin
      .from('tasks')
      .insert({
        title: `Policy Matrix Task ${runId}`,
        project_id: project.id,
        status: 'todo',
        priority: 'medium',
        assignee_id: userIds.member,
        sort_order: 1,
        created_by: userIds.admin,
        organization_id: org.id,
      })
      .select('id')
      .single()
    if (taskError || !task) throw new Error(`Failed to create task: ${taskError?.message || 'unknown error'}`)
    cleanup.taskId = task.id

    const { error: orgMembershipError } = await admin.from('organization_memberships').insert([
      { organization_id: org.id, user_id: userIds.admin, org_role: 'org_admin', status: 'active' },
      { organization_id: org.id, user_id: userIds.lead, org_role: 'org_member', status: 'active' },
      { organization_id: org.id, user_id: userIds.member, org_role: 'org_member', status: 'active' },
      { organization_id: org.id, user_id: userIds.client, org_role: 'client_portal', status: 'active' },
    ])
    if (orgMembershipError) {
      throw new Error(`Failed to create organization memberships: ${orgMembershipError.message}`)
    }

    const { data: memberships, error: membershipsError } = await admin
      .from('organization_memberships')
      .select('id, user_id')
      .eq('organization_id', org.id)
      .in('user_id', [userIds.lead, userIds.member])

    if (membershipsError || !memberships) {
      throw new Error(`Failed to load organization memberships: ${membershipsError?.message || 'unknown error'}`)
    }

    const leadMembershipId = memberships.find((m) => m.user_id === userIds.lead)?.id
    const memberMembershipId = memberships.find((m) => m.user_id === userIds.member)?.id
    if (!leadMembershipId || !memberMembershipId) {
      throw new Error('Failed to map team memberships to org memberships')
    }

    const { error: teamMembershipError } = await admin.from('team_memberships').insert([
      { organization_membership_id: leadMembershipId, team_id: team.id, team_role: 'team_lead', status: 'active' },
      { organization_membership_id: memberMembershipId, team_id: team.id, team_role: 'team_member', status: 'active' },
    ])
    if (teamMembershipError) {
      throw new Error(`Failed to create team memberships: ${teamMembershipError.message}`)
    }

    const { error: clientMembershipError } = await admin.from('client_memberships').insert({
      client_id: clientRow.id,
      user_id: userIds.client,
      client_role: 'client_member',
      status: 'active',
    })
    if (clientMembershipError) {
      throw new Error(`Failed to create client membership: ${clientMembershipError.message}`)
    }

    const userClients = {
      admin: await signInUser(supabaseUrl, anonKey, mkEmail('admin'), password, 'admin'),
      lead: await signInUser(supabaseUrl, anonKey, mkEmail('lead'), password, 'lead'),
      member: await signInUser(supabaseUrl, anonKey, mkEmail('member'), password, 'member'),
      client: await signInUser(supabaseUrl, anonKey, mkEmail('client'), password, 'client'),
    }

    const argValues = {
      check_team_id: team.id,
      check_project_id: project.id,
      check_task_id: task.id,
      check_client_id: clientRow.id,
    }

    const failures = []
    const passes = []

    for (const rule of POLICY_MATRIX) {
      for (const role of ROLE_ORDER) {
        const expected = rule.expected[role]
        const clientForRole = userClients[role]
        const { data, error } = await clientForRole.rpc(rule.fn, {
          [rule.arg]: argValues[rule.arg],
        })

        if (error) {
          failures.push(`${role}:${rule.fn} rpc error -> ${error.message}`)
          continue
        }

        const actual = toBool(data)
        if (actual !== expected) {
          failures.push(`${role}:${rule.fn} expected ${expected}, got ${actual}`)
          continue
        }

        passes.push(`${role}:${rule.fn}`)
      }
    }

    if (failures.length > 0) {
      return {
        ok: false,
        message: `Live policy matrix failed (${passes.length} passed, ${failures.length} failed)`,
        failures,
      }
    }

    return {
      ok: true,
      message: `Live policy matrix passed (${passes.length} checks)`,
      failures: [],
    }
  } finally {
    if (cleanup.taskId) {
      await admin.from('tasks').delete().eq('id', cleanup.taskId)
    }
    if (cleanup.projectId) {
      await admin.from('projects').delete().eq('id', cleanup.projectId)
    }
    if (cleanup.clientId) {
      await admin.from('clients').delete().eq('id', cleanup.clientId)
    }
    if (cleanup.teamId) {
      await admin.from('teams').delete().eq('id', cleanup.teamId)
    }
    if (cleanup.organizationId) {
      await admin.from('client_memberships').delete().eq('client_id', cleanup.clientId)
      await admin.from('team_memberships').delete().eq('team_id', cleanup.teamId)
      await admin.from('organization_memberships').delete().eq('organization_id', cleanup.organizationId)
      await admin.from('organizations').delete().eq('id', cleanup.organizationId)
    }

    for (const userId of createdUserIds) {
      await admin.auth.admin.deleteUser(userId)
    }
  }
}

async function main() {
  const runLive = parseFlag('--live') || parseBoolean(process.env.POLICY_MATRIX_LIVE)

  const staticResult = runStaticPolicyCoverageCheck()
  if (!staticResult.ok) {
    console.error('Policy matrix static coverage check failed.')
    for (const err of staticResult.errors) {
      console.error(`- ${err}`)
    }
    process.exit(1)
  }

  console.log('Policy matrix static coverage check passed.')

  if (!runLive) {
    console.log('Live checks skipped. Use --live or POLICY_MATRIX_LIVE=1 to run DB assertions.')
    return
  }

  try {
    const liveResult = await runLivePolicyMatrix()
    if (!liveResult.ok) {
      console.error(liveResult.message)
      for (const failure of liveResult.failures) {
        console.error(`- ${failure}`)
      }
      process.exit(1)
    }
    console.log(liveResult.message)
  } catch (error) {
    console.error(`Live policy matrix execution failed: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

void main()
