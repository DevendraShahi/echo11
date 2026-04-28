-- Harden RLS for shared client portal domains.
-- Goal: explicit ownership rules between agency (/lab) and client (/client).

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- clients policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Clients can read own profile" ON clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON clients;
DROP POLICY IF EXISTS "Agency can read clients" ON clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

CREATE POLICY "Clients can read own profile" ON clients
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Clients can update own profile" ON clients
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Agency can read clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins can insert clients" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- client_messages policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Clients can read own messages" ON client_messages;
DROP POLICY IF EXISTS "Clients can send messages" ON client_messages;
DROP POLICY IF EXISTS "Team can send messages" ON client_messages;
DROP POLICY IF EXISTS "Clients can read own thread" ON client_messages;
DROP POLICY IF EXISTS "Agency can read client messages" ON client_messages;
DROP POLICY IF EXISTS "Clients can send own messages" ON client_messages;
DROP POLICY IF EXISTS "Agency can send team messages" ON client_messages;
DROP POLICY IF EXISTS "Clients can update own thread message flags" ON client_messages;
DROP POLICY IF EXISTS "Agency can update team message flags" ON client_messages;

CREATE POLICY "Clients can read own thread" ON client_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM clients c
      WHERE c.id = client_messages.client_id
        AND c.auth_id = auth.uid()
    )
  );

CREATE POLICY "Agency can read client messages" ON client_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Clients can send own messages" ON client_messages
  FOR INSERT WITH CHECK (
    sender_type = 'client'
    AND EXISTS (
      SELECT 1
      FROM clients c
      WHERE c.id = client_messages.client_id
        AND c.auth_id = auth.uid()
    )
  );

CREATE POLICY "Agency can send team messages" ON client_messages
  FOR INSERT WITH CHECK (
    sender_type = 'team'
    AND EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Clients can update own thread message flags" ON client_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM clients c
      WHERE c.id = client_messages.client_id
        AND c.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM clients c
      WHERE c.id = client_messages.client_id
        AND c.auth_id = auth.uid()
    )
  );

CREATE POLICY "Agency can update team message flags" ON client_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'member')
    )
  );

CREATE INDEX IF NOT EXISTS idx_client_messages_client_created_at
  ON client_messages (client_id, created_at DESC);
