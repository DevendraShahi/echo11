-- Replace service-role invite acceptance paths with SECURITY DEFINER RPCs.

CREATE OR REPLACE FUNCTION public.get_team_invite_details(p_invite_id uuid)
RETURNS TABLE(email text, role text, job_title text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ti.email, ti.role, ti.job_title
  FROM public.team_invites ti
  WHERE ti.id = p_invite_id
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.accept_team_invite(
  p_invite_id uuid,
  p_user_id uuid,
  p_full_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_row public.team_invites%ROWTYPE;
  auth_email text;
  normalized_name text;
BEGIN
  SELECT * INTO invite_row
  FROM public.team_invites
  WHERE id = p_invite_id
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT email INTO auth_email
  FROM auth.users
  WHERE id = p_user_id;

  IF auth_email IS NULL OR lower(auth_email) <> lower(invite_row.email) THEN
    RETURN false;
  END IF;

  normalized_name := NULLIF(trim(p_full_name), '');

  UPDATE public.profiles
  SET
    role = invite_row.role,
    job_title = invite_row.job_title,
    full_name = COALESCE(normalized_name, full_name),
    updated_at = now()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role, job_title)
    VALUES (p_user_id, auth_email, normalized_name, invite_row.role, invite_row.job_title)
    ON CONFLICT (id) DO UPDATE
    SET
      role = EXCLUDED.role,
      job_title = EXCLUDED.job_title,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = now();
  END IF;

  UPDATE public.team_invites
  SET status = 'accepted'
  WHERE id = p_invite_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_invite_details(p_token text)
RETURNS TABLE(client_id uuid, email text, company_name text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT c.id AS client_id, c.email, c.company_name
  FROM public.clients c
  WHERE c.invitation_token = p_token
    AND (
      c.invitation_token_expires_at IS NULL
      OR c.invitation_token_expires_at > now()
    )
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.accept_client_invite(
  p_client_id uuid,
  p_auth_user_id uuid,
  p_full_name text,
  p_invite_email text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_row public.clients%ROWTYPE;
  auth_email text;
  normalized_name text;
BEGIN
  SELECT * INTO client_row
  FROM public.clients
  WHERE id = p_client_id
    AND invitation_token IS NOT NULL
    AND (
      invitation_token_expires_at IS NULL
      OR invitation_token_expires_at > now()
    );

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT email INTO auth_email
  FROM auth.users
  WHERE id = p_auth_user_id;

  IF auth_email IS NULL THEN
    RETURN false;
  END IF;

  IF lower(auth_email) <> lower(client_row.email) THEN
    RETURN false;
  END IF;

  IF p_invite_email IS NOT NULL AND lower(auth_email) <> lower(p_invite_email) THEN
    RETURN false;
  END IF;

  normalized_name := NULLIF(trim(p_full_name), '');

  UPDATE public.profiles
  SET
    role = 'client',
    full_name = COALESCE(normalized_name, full_name),
    updated_at = now()
  WHERE id = p_auth_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (p_auth_user_id, auth_email, normalized_name, 'client')
    ON CONFLICT (id) DO UPDATE
    SET
      role = EXCLUDED.role,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      updated_at = now();
  END IF;

  UPDATE public.clients
  SET
    auth_id = p_auth_user_id,
    invitation_token = NULL,
    invitation_token_expires_at = NULL,
    invitation_accepted_at = now()
  WHERE id = p_client_id;

  IF to_regclass('public.client_memberships') IS NOT NULL THEN
    INSERT INTO public.client_memberships (client_id, user_id, client_role, status)
    VALUES (p_client_id, p_auth_user_id, 'client_admin', 'active')
    ON CONFLICT (client_id, user_id) DO NOTHING;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_team_invite_details(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_team_invite(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_client_invite_details(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_client_invite(uuid, uuid, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_team_invite_details(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invite(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_invite_details(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_client_invite(uuid, uuid, text, text) TO authenticated;
