-- Create team_invites table
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

-- Add unique constraint on email with pending status
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invites_pending_email 
ON team_invites (LOWER(email)) WHERE status = 'pending';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_invited_by ON team_invites(invited_by);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view invites they sent
CREATE POLICY "Users can view own invites" ON team_invites
  FOR SELECT USING (invited_by = auth.uid());

-- RLS Policy: Users can create invites
CREATE POLICY "Users can create invites" ON team_invites
  FOR INSERT WITH CHECK (invited_by = auth.uid());

-- RLS Policy: Users can update (cancel/resend) their own invites
CREATE POLICY "Users can update own invites" ON team_invites
  FOR UPDATE USING (invited_by = auth.uid());

-- RLS Policy: Users can delete their own invites
CREATE POLICY "Users can delete own invites" ON team_invites
  FOR DELETE USING (invited_by = auth.uid());;
