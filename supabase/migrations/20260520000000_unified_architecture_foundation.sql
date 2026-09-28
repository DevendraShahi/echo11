-- Unified architecture foundation (org tenancy, memberships, concurrency, idempotency, outbox, projections, audit)
-- Phase-safe migration: additive + backfill + compatibility defaults.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organizations + membership model
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_role text NOT NULL CHECK (org_role IN ('org_owner', 'org_admin', 'org_member', 'client_portal')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_membership_id uuid NOT NULL REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_role text NOT NULL DEFAULT 'team_member' CHECK (team_role IN ('team_lead', 'team_member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_membership_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.client_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_role text NOT NULL DEFAULT 'client_member' CHECK (client_role IN ('client_admin', 'client_member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Tenancy spine + optimistic concurrency columns
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.contracts ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.meetings ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS lock_version bigint NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.tasks ADD COLUMN IF NOT EXISTS lock_version bigint NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.clients ADD COLUMN IF NOT EXISTS lock_version bigint NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS lock_version bigint NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.contracts ADD COLUMN IF NOT EXISTS lock_version bigint NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- Request idempotency + outbox + projections + immutable audit
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.request_dedup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  finalized_at timestamptz,
  UNIQUE (actor_id, route, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz,
  dispatch_attempts integer NOT NULL DEFAULT 0,
  last_error text
);

CREATE TABLE IF NOT EXISTS public.client_dashboard_projection (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.team_workload_projection (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, team_id)
);

CREATE TABLE IF NOT EXISTS public.unread_counts_projection (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unread_notifications integer NOT NULL DEFAULT 0,
  unread_client_messages integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.activity_projection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  correlation_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_events_org_created_at ON public.domain_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_events_dispatch ON public.domain_events(dispatched_at, dispatch_attempts, created_at);
CREATE INDEX IF NOT EXISTS idx_request_dedup_actor_route_created ON public.request_dedup(actor_id, route, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_occurred ON public.audit_log(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_projection_org_occurred ON public.activity_projection(organization_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- Default org bootstrap + backfill
-- ---------------------------------------------------------------------------
WITH inserted AS (
  INSERT INTO public.organizations (name, slug)
  VALUES ('Echo11 Default Organization', 'echo11-default-org')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
SELECT id FROM inserted;

DO $$
DECLARE
  default_org uuid;
BEGIN
  SELECT id INTO default_org FROM public.organizations WHERE slug = 'echo11-default-org' LIMIT 1;

  -- profiles first
  IF default_org IS NOT NULL THEN
    UPDATE public.profiles p
    SET organization_id = default_org
    WHERE p.organization_id IS NULL;

    UPDATE public.teams t
    SET organization_id = COALESCE(
      (SELECT p.organization_id FROM public.profiles p WHERE p.id = t.lead_id),
      default_org
    )
    WHERE t.organization_id IS NULL;

    UPDATE public.clients c
    SET organization_id = COALESCE(
      (SELECT p.organization_id FROM public.profiles p WHERE p.id = c.created_by),
      default_org
    )
    WHERE c.organization_id IS NULL;

    UPDATE public.projects p
    SET organization_id = COALESCE(
      (SELECT t.organization_id FROM public.teams t WHERE t.id = p.team_id),
      (SELECT c.organization_id FROM public.clients c WHERE c.id = p.client_id),
      default_org
    )
    WHERE p.organization_id IS NULL;

    UPDATE public.tasks t
    SET organization_id = COALESCE(
      (SELECT p.organization_id FROM public.projects p WHERE p.id = t.project_id),
      default_org
    )
    WHERE t.organization_id IS NULL;

    UPDATE public.invoices i
    SET organization_id = COALESCE(
      (SELECT p.organization_id FROM public.projects p WHERE p.id = i.project_id),
      (SELECT c.organization_id FROM public.clients c WHERE c.id = i.client_id),
      default_org
    )
    WHERE i.organization_id IS NULL;

    UPDATE public.contracts c
    SET organization_id = COALESCE(
      (SELECT cl.organization_id FROM public.clients cl WHERE cl.id = c.client_id),
      default_org
    )
    WHERE c.organization_id IS NULL;

    UPDATE public.meetings m
    SET organization_id = COALESCE(
      (SELECT p.organization_id FROM public.projects p WHERE p.id = m.project_id),
      default_org
    )
    WHERE m.organization_id IS NULL;
  END IF;
END $$;

-- backfill org memberships from profiles
INSERT INTO public.organization_memberships (organization_id, user_id, org_role, status)
SELECT
  p.organization_id,
  p.id,
  CASE
    WHEN p.role = 'admin' THEN 'org_admin'
    WHEN p.role = 'client' THEN 'client_portal'
    ELSE 'org_member'
  END,
  'active'
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- backfill team memberships from profiles.team_id
INSERT INTO public.team_memberships (organization_membership_id, team_id, team_role, status)
SELECT
  om.id,
  p.team_id,
  CASE WHEN t.lead_id = p.id THEN 'team_lead' ELSE 'team_member' END,
  'active'
FROM public.profiles p
JOIN public.organization_memberships om
  ON om.user_id = p.id
 AND om.organization_id = p.organization_id
JOIN public.teams t
  ON t.id = p.team_id
WHERE p.team_id IS NOT NULL
ON CONFLICT (organization_membership_id, team_id) DO NOTHING;

-- ensure explicit team_lead membership for team leads
INSERT INTO public.team_memberships (organization_membership_id, team_id, team_role, status)
SELECT
  om.id,
  t.id,
  'team_lead',
  'active'
FROM public.teams t
JOIN public.organization_memberships om
  ON om.user_id = t.lead_id
 AND om.organization_id = t.organization_id
WHERE t.lead_id IS NOT NULL
ON CONFLICT (organization_membership_id, team_id) DO UPDATE
SET team_role = EXCLUDED.team_role,
    status = EXCLUDED.status,
    updated_at = now();

-- backfill client memberships from linked client users
INSERT INTO public.client_memberships (client_id, user_id, client_role, status)
SELECT
  c.id,
  c.auth_id,
  'client_admin',
  'active'
FROM public.clients c
WHERE c.auth_id IS NOT NULL
ON CONFLICT (client_id, user_id) DO NOTHING;

-- enforce org id required on core entities after backfill
ALTER TABLE IF EXISTS public.teams ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE IF EXISTS public.clients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE IF EXISTS public.projects ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE IF EXISTS public.tasks ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE IF EXISTS public.contracts ALTER COLUMN organization_id SET NOT NULL;

-- ---------------------------------------------------------------------------
-- Concurrency trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_lock_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.lock_version = COALESCE(OLD.lock_version, 0) + 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_lock_version ON public.projects;
CREATE TRIGGER trg_projects_lock_version
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.bump_lock_version();

DROP TRIGGER IF EXISTS trg_tasks_lock_version ON public.tasks;
CREATE TRIGGER trg_tasks_lock_version
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.bump_lock_version();

DROP TRIGGER IF EXISTS trg_clients_lock_version ON public.clients;
CREATE TRIGGER trg_clients_lock_version
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.bump_lock_version();

DROP TRIGGER IF EXISTS trg_invoices_lock_version ON public.invoices;
CREATE TRIGGER trg_invoices_lock_version
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.bump_lock_version();

DROP TRIGGER IF EXISTS trg_contracts_lock_version ON public.contracts;
CREATE TRIGGER trg_contracts_lock_version
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.bump_lock_version();

-- ---------------------------------------------------------------------------
-- RBAC helper functions (DB-first authorization primitives)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  WITH jwt_org AS (
    SELECT NULLIF((current_setting('request.jwt.claims', true)::jsonb ->> 'organization_id'), '')::uuid AS org_id
  )
  SELECT COALESCE(
    (SELECT org_id FROM jwt_org),
    (
      SELECT om.organization_id
      FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
      ORDER BY om.created_at ASC
      LIMIT 1
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(check_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = check_org_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.org_role IN ('org_owner', 'org_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_team(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = check_team_id
      AND (
        public.is_org_admin(t.organization_id)
        OR EXISTS (
          SELECT 1
          FROM public.team_memberships tm
          JOIN public.organization_memberships om ON om.id = tm.organization_membership_id
          WHERE tm.team_id = t.id
            AND tm.status = 'active'
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_team(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = check_team_id
      AND (
        public.is_org_admin(t.organization_id)
        OR EXISTS (
          SELECT 1
          FROM public.team_memberships tm
          JOIN public.organization_memberships om ON om.id = tm.organization_membership_id
          WHERE tm.team_id = t.id
            AND tm.status = 'active'
            AND tm.team_role = 'team_lead'
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_project(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = check_project_id
      AND (
        public.is_org_admin(p.organization_id)
        OR public.can_read_team(p.team_id)
        OR EXISTS (
          SELECT 1
          FROM public.tasks t
          WHERE t.project_id = p.id
            AND t.assignee_id = auth.uid()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_project(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = check_project_id
      AND (
        public.is_org_admin(p.organization_id)
        OR public.can_manage_team(p.team_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_task(check_task_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.id = check_task_id
      AND (
        public.is_org_admin(t.organization_id)
        OR t.assignee_id = auth.uid()
        OR public.can_manage_project(t.project_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_task(check_task_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.id = check_task_id
      AND (
        public.is_org_admin(t.organization_id)
        OR t.assignee_id = auth.uid()
        OR public.can_manage_project(t.project_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_read_client(check_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients c
    WHERE c.id = check_client_id
      AND (
        public.is_org_admin(c.organization_id)
        OR EXISTS (
          SELECT 1
          FROM public.client_memberships cm
          WHERE cm.client_id = c.id
            AND cm.user_id = auth.uid()
            AND cm.status = 'active'
        )
        OR EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.client_id = c.id
            AND public.can_read_team(p.team_id)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_client(check_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients c
    WHERE c.id = check_client_id
      AND (
        public.is_org_admin(c.organization_id)
        OR EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.client_id = c.id
            AND public.can_manage_team(p.team_id)
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.current_organization_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_team(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_team(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_project(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_project(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_task(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_task(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_read_client(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_client(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_client(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS for new tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_dedup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_dashboard_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_workload_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unread_counts_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read organizations" ON public.organizations;
CREATE POLICY "Org members can read organizations" ON public.organizations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Org admins can manage organizations" ON public.organizations;
CREATE POLICY "Org admins can manage organizations" ON public.organizations
  FOR ALL TO authenticated
  USING (public.is_org_admin(organizations.id))
  WITH CHECK (public.is_org_admin(organizations.id));

DROP POLICY IF EXISTS "Users can read own org memberships" ON public.organization_memberships;
CREATE POLICY "Users can read own org memberships" ON public.organization_memberships
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR public.is_org_admin(organization_id)
  );

DROP POLICY IF EXISTS "Org admins can manage org memberships" ON public.organization_memberships;
CREATE POLICY "Org admins can manage org memberships" ON public.organization_memberships
  FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "Team scoped read memberships" ON public.team_memberships;
CREATE POLICY "Team scoped read memberships" ON public.team_memberships
  FOR SELECT TO authenticated
  USING (public.can_read_team(team_id));

DROP POLICY IF EXISTS "Team managers can manage memberships" ON public.team_memberships;
CREATE POLICY "Team managers can manage memberships" ON public.team_memberships
  FOR ALL TO authenticated
  USING (public.can_manage_team(team_id))
  WITH CHECK (public.can_manage_team(team_id));

DROP POLICY IF EXISTS "Client scoped read memberships" ON public.client_memberships;
CREATE POLICY "Client scoped read memberships" ON public.client_memberships
  FOR SELECT TO authenticated
  USING (public.can_read_client(client_id));

DROP POLICY IF EXISTS "Client managers can manage memberships" ON public.client_memberships;
CREATE POLICY "Client managers can manage memberships" ON public.client_memberships
  FOR ALL TO authenticated
  USING (public.can_manage_client(client_id))
  WITH CHECK (public.can_manage_client(client_id));

DROP POLICY IF EXISTS "Users can manage own request dedup" ON public.request_dedup;
CREATE POLICY "Users can manage own request dedup" ON public.request_dedup
  FOR ALL TO authenticated
  USING (actor_id = auth.uid())
  WITH CHECK (actor_id = auth.uid());

DROP POLICY IF EXISTS "Org members can read domain events" ON public.domain_events;
CREATE POLICY "Org members can read domain events" ON public.domain_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_memberships om
      WHERE om.organization_id = domain_events.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Org members can create domain events" ON public.domain_events;
CREATE POLICY "Org members can create domain events" ON public.domain_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organization_memberships om
      WHERE om.organization_id = domain_events.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Scoped client dashboard projection read" ON public.client_dashboard_projection;
CREATE POLICY "Scoped client dashboard projection read" ON public.client_dashboard_projection
  FOR SELECT TO authenticated
  USING (
    public.can_read_client(client_id)
  );

DROP POLICY IF EXISTS "Scoped team workload projection read" ON public.team_workload_projection;
CREATE POLICY "Scoped team workload projection read" ON public.team_workload_projection
  FOR SELECT TO authenticated
  USING (
    public.can_read_team(team_id)
  );

DROP POLICY IF EXISTS "Users read own unread projection" ON public.unread_counts_projection;
CREATE POLICY "Users read own unread projection" ON public.unread_counts_projection
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Org members read activity projection" ON public.activity_projection;
CREATE POLICY "Org members read activity projection" ON public.activity_projection
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_memberships om
      WHERE om.organization_id = activity_projection.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Org members read audit log" ON public.audit_log;
CREATE POLICY "Org members read audit log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organization_memberships om
      WHERE om.organization_id = audit_log.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- append-only protection for audit log
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated;

