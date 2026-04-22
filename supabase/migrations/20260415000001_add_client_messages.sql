-- Client portal messaging table

CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'team')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  read_by_client BOOLEAN DEFAULT false,
  read_by_team BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for client_messages
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;

-- Read policy - clients can read their own messages
CREATE POLICY "Clients can read own messages" ON client_messages
  FOR SELECT USING (true);

-- Insert policy - both client and team can insert
CREATE POLICY "Clients can send messages" ON client_messages
  FOR INSERT WITH CHECK (sender_type = 'client');

CREATE POLICY "Team can send messages" ON client_messages
  FOR INSERT WITH CHECK (sender_type = 'team');

-- Index for fetching client messages
CREATE INDEX idx_client_messages_client_id ON client_messages(client_id DESC);
