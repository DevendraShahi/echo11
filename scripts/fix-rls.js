const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function fixRLS() {
  try {
    await client.connect()
    console.log('Connected to database')

    // Fix services policies - allow authenticated users to read
    await client.query(`
      DROP POLICY IF EXISTS "Team can manage services" ON services
    `)
    console.log('Dropped old services policy')

    await client.query(`
      CREATE POLICY "services_read_policy" ON services 
      FOR SELECT USING (auth.role() = 'authenticated')
    `)
    console.log('Created services SELECT policy')

    await client.query(`
      CREATE POLICY "services_manage_policy" ON services 
      FOR ALL USING (auth.role() = 'authenticated')
    `)
    console.log('Created services ALL policy')

    // Fix clients policies - allow authenticated users to read
    await client.query(`
      DROP POLICY IF EXISTS "Team can manage clients" ON clients
    `)
    await client.query(`
      DROP POLICY IF EXISTS "Clients can be read by team" ON clients
    `)
    console.log('Dropped old clients policies')

    await client.query(`
      CREATE POLICY "clients_read_policy" ON clients 
      FOR SELECT USING (auth.role() = 'authenticated')
    `)
    console.log('Created clients SELECT policy')

    await client.query(`
      CREATE POLICY "clients_manage_policy" ON clients 
      FOR ALL USING (auth.role() = 'authenticated')
    `)
    console.log('Created clients ALL policy')

    console.log('\n✅ All RLS policies fixed!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

fixRLS()
