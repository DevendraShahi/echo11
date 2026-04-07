const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function addRLSPolicies() {
  try {
    await client.connect()
    console.log('Connected to database')

    // Clients policies
    await client.query(`
      CREATE POLICY "Team can manage clients" ON clients
        FOR ALL USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'member'))
        )
    `)
    console.log('Clients policy added')

    // Services policies
    await client.query(`
      CREATE POLICY "Team can manage services" ON services
        FOR ALL USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'member'))
        )
    `)
    console.log('Services policy added')

    // Also add clients policy for reading (needed for client selection)
    await client.query(`
      CREATE POLICY "Clients can be read by team" ON clients
        FOR SELECT USING (
          created_by = auth.uid() OR
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'member'))
        )
    `)
    console.log('Clients read policy added')

    console.log('\nAll policies added successfully!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

addRLSPolicies()
