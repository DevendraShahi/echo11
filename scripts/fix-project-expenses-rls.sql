-- Fix RLS for project_expenses table
-- Run this in your Supabase SQL Editor

-- First, check if there are any existing policies and remove them
DROP POLICY IF EXISTS "Team can manage project_expenses" ON project_expenses;

-- Create a simpler, more reliable policy
-- This checks if user exists in profiles with admin or member role
CREATE POLICY "Team can manage project_expenses" ON project_expenses
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'member')
    )
  );