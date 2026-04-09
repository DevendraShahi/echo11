-- Add job_title to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add job_title to team_invites
ALTER TABLE public.team_invites
ADD COLUMN IF NOT EXISTS job_title TEXT;
