const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function addTestClient() {
  try {
    await client.connect()
    console.log('Connected to database')

    await client.query(`
      INSERT INTO clients (company_name, contact_name, email, phone) 
      VALUES ('Test Company', 'John Doe', 'test@test.com', '+1234567890')
    `)
    console.log('Test client added')

    const result = await client.query('SELECT * FROM clients')
    console.log('Clients in DB:', result.rows.length)
    console.log(JSON.stringify(result.rows, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

addTestClient()
