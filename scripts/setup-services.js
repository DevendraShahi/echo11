const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    console.log('UUID extension enabled')

    // Create services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        default_rate DECIMAL(12,2) DEFAULT 0,
        unit TEXT DEFAULT 'fixed' CHECK (unit IN ('hour', 'month', 'fixed', 'item')),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('Services table created')

    // Create project_expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_expenses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(id) ON DELETE SET NULL,
        description TEXT,
        quantity DECIMAL(10,2) DEFAULT 1,
        rate DECIMAL(12,2) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `)
    console.log('Project_expenses table created')

    // Add weight column to milestones if not exists
    await client.query(`
      ALTER TABLE milestones ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 0 CHECK (weight >= 0 and weight <= 100)
    `)
    console.log('Weight column added to milestones')

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`)
    console.log('Indexes created')

    // Insert default services
    const defaultServices = [
      ['Frontend Development', 'Development', 'Frontend development services', 50, 'hour'],
      ['Backend Development', 'Development', 'Backend development services', 60, 'hour'],
      ['Full Stack Development', 'Development', 'Full stack web development', 70, 'hour'],
      ['API Development', 'Development', 'RESTful API development', 55, 'hour'],
      ['Database Design', 'Development', 'Database architecture and design', 45, 'hour'],
      ['UI Design', 'Design', 'User interface design', 45, 'hour'],
      ['UX Design', 'Design', 'User experience design', 50, 'hour'],
      ['Logo Design', 'Design', 'Logo and brand identity', 300, 'fixed'],
      ['Prototyping', 'Design', 'Interactive prototypes', 250, 'fixed'],
      ['Domain Purchase', 'Domain & Hosting', 'Domain name registration', 15, 'item'],
      ['Annual Hosting', 'Domain & Hosting', 'Web hosting (yearly)', 120, 'fixed'],
      ['SSL Certificate', 'Domain & Hosting', 'SSL security certificate', 50, 'fixed'],
      ['Server Setup', 'Domain & Hosting', 'Server configuration', 100, 'fixed'],
      ['Monthly Maintenance', 'Maintenance', 'Monthly website maintenance', 150, 'month'],
      ['Support Hours', 'Maintenance', 'Technical support hours', 40, 'hour'],
      ['Training', 'Other', 'Client training session', 75, 'hour'],
      ['Documentation', 'Other', 'Project documentation', 200, 'fixed'],
      ['Consultation', 'Other', 'Technical consultation', 100, 'hour'],
    ]

    for (const service of defaultServices) {
      await client.query(
        `INSERT INTO services (name, category, description, default_rate, unit) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
        service
      )
    }
    console.log('Default services inserted')

    console.log('\nDatabase setup complete!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

setupDatabase()
