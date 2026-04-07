-- Fix RLS for profiles table to allow JOIN in tasks query
-- This fixes the issue where tasks don't load because profiles has no SELECT policy

-- Add SELECT policy to profiles (already has RLS enabled, just need the policy)
DROP POLICY IF EXISTS "Profiles readable by authenticated" ON profiles;

CREATE POLICY "Profiles readable by authenticated" ON profiles
  FOR SELECT USING (true);

-- Also ensure tasks can be selected properly
DROP POLICY IF EXISTS "Tasks readable by all authenticated" ON tasks;

CREATE POLICY "Tasks readable by all authenticated" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Ensure projects can be joined properly
DROP POLICY IF EXISTS "Projects readable by all authenticated" ON projects;

CREATE POLICY "Projects readable by all authenticated" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');