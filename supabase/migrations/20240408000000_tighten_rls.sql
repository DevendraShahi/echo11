-- Tighten contracts table RLS: only authenticated users can read
DROP POLICY IF EXISTS "Users can view contracts" ON contracts;

CREATE POLICY "Authenticated users can view contracts" ON contracts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tighten storage bucket: only authenticated users can download contract files
DROP POLICY IF EXISTS "Anyone can view contract files" ON storage.objects;

CREATE POLICY "Authenticated users can view contract files" ON storage.objects
  FOR SELECT USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- Tighten project_expenses: users should only manage expenses for projects they belong to
-- (keeping simple authenticated restriction for now, can scope to team later)
-- Already in place from fix_rls.sql, no change needed.

-- team_invites: ensure anon cannot read (only service role can via admin client)
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ
);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view invites" ON team_invites;
DROP POLICY IF EXISTS "Admins can manage invites" ON team_invites;

CREATE POLICY "Authenticated users can view their own invites" ON team_invites
  FOR SELECT USING (auth.uid() = invited_by);

CREATE POLICY "Authenticated users can insert invites" ON team_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

CREATE POLICY "Authenticated users can update invites they sent" ON team_invites
  FOR UPDATE USING (auth.uid() = invited_by);

CREATE POLICY "Authenticated users can delete invites they sent" ON team_invites
  FOR DELETE USING (auth.uid() = invited_by);
