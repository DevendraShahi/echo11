const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function fixProjectsRLS() {
  try {
    await client.connect()
    console.log('Connected to database')

    // Check existing policies
    const existingPolicies = await client.query(`
      SELECT policyname, cmd FROM pg_policies WHERE tablename = 'projects'
    `)
    console.log('Existing policies:', existingPolicies.rows)

    // Add SELECT policy
    await client.query(`
      CREATE POLICY "projects_select_policy" ON projects
      FOR SELECT USING (auth.role() = 'authenticated')
    `)
    console.log('Added SELECT policy')

    // Add INSERT policy
    await client.query(`
      CREATE POLICY "projects_insert_policy" ON projects
      FOR INSERT WITH CHECK (auth.role() = 'authenticated')
    `)
    console.log('Added INSERT policy')

    // Add UPDATE policy
    await client.query(`
      CREATE POLICY "projects_update_policy" ON projects
      FOR UPDATE USING (auth.role() = 'authenticated')
    `)
    console.log('Added UPDATE policy')

    // Add DELETE policy
    await client.query(`
      CREATE POLICY "projects_delete_policy" ON projects
      FOR DELETE USING (auth.role() = 'authenticated')
    `)
    console.log('Added DELETE policy')

    console.log('\n✅ All RLS policies for projects table added!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

fixProjectsRLS()
