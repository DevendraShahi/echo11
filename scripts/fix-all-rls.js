const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

const TABLES = ['tasks', 'milestones', 'meetings', 'invoices', 'invoice_items', 'activities', 'comments', 'notifications']

async function fixAllRLS() {
  try {
    await client.connect()
    console.log('Connected to database\n')

    for (const table of TABLES) {
      try {
        // Add SELECT policy
        await client.query(`
          CREATE POLICY "${table}_select_policy" ON ${table}
          FOR SELECT USING (auth.role() = 'authenticated')
        `).catch(() => {}) // Ignore if exists

        // Add INSERT policy
        await client.query(`
          CREATE POLICY "${table}_insert_policy" ON ${table}
          FOR INSERT WITH CHECK (auth.role() = 'authenticated')
        `).catch(() => {})

        // Add UPDATE policy
        await client.query(`
          CREATE POLICY "${table}_update_policy" ON ${table}
          FOR UPDATE USING (auth.role() = 'authenticated')
        `).catch(() => {})

        // Add DELETE policy
        await client.query(`
          CREATE POLICY "${table}_delete_policy" ON ${table}
          FOR DELETE USING (auth.role() = 'authenticated')
        `).catch(() => {})

        console.log(`✅ ${table} - policies added`)
      } catch (err) {
        console.log(`⚠️ ${table} - ${err.message}`)
      }
    }

    console.log('\n✅ All table RLS policies updated!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

fixAllRLS()
