const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Add auth_id column to clients
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
    `)
    console.log('auth_id column added to clients')

    // Add profile_id column to clients
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL
    `)
    console.log('profile_id column added to clients')

    // Add invitation_sent_at column
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz
    `)
    console.log('invitation_sent_at column added')

    // Add invitation_token column
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_token text
    `)
    console.log('invitation_token column added')

    // Add invitation_accepted_at column
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_accepted_at timestamptz
    `)
    console.log('invitation_accepted_at column added')

    // Add unique constraint on email (if not already)
    // Note: This will fail if there are duplicate emails, handle manually if needed

    // Create index on auth_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_auth_id ON clients(auth_id)
    `)
    console.log('Index on auth_id created')

    // Create index on profile_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON clients(profile_id)
    `)
    console.log('Index on profile_id created')

    // Add RLS policy for clients to view their own record (already covered by existing team policy)
    // Just ensure the client auth_id linking works
    
    console.log('Client auth columns ready')

    console.log('\nMigration complete!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

migrate()
