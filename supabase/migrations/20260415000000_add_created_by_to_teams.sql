-- Add created_by column to teams table

ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add RLS policy for created_by
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Users can read teams
CREATE POLICY "Users can read teams" ON teams FOR SELECT USING (true);

-- Users can insert teams (must be authenticated)
CREATE POLICY "Users can insert teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Team lead can update their team
CREATE POLICY "Users can update teams" ON teams FOR UPDATE USING (
  auth.uid() = lead_id OR auth.uid() = created_by
);

-- Only creator can delete
CREATE POLICY "Users can delete teams" ON teams FOR DELETE USING (auth.uid() = created_by);
