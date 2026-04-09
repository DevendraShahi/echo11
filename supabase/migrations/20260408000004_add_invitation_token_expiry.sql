-- Add expiry column for client portal invitation tokens
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS invitation_token_expires_at TIMESTAMPTZ;
