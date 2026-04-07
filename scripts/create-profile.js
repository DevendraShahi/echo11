const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function createProfile() {
  try {
    await client.connect()
    console.log('Connected to database')

    // Get auth user
    const authResult = await client.query('SELECT id, email FROM auth.users LIMIT 1')
    const authUser = authResult.rows[0]
    
    if (!authUser) {
      console.log('No auth users found')
      return
    }

    console.log('Auth user:', authUser.email)

    // Insert profile
    await client.query(`
      INSERT INTO profiles (id, email, full_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [authUser.id, authUser.email, 'Devendra Shah', 'admin'])
    
    console.log('Profile created successfully!')

    // Verify
    const profileResult = await client.query('SELECT * FROM profiles')
    console.log('Profiles:', profileResult.rows)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

createProfile()
