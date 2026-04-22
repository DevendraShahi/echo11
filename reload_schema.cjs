const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hwddfqgxmdhsmjzydywz:EIHIti0ogBCW45ZW@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
  connectionString,
});

async function run() {
  await client.connect();
  try {
     await client.query(`NOTIFY pgrst, 'reload schema'`);
     console.log('Schema reload triggered!');
  } catch (err) {
     console.log('Error:', err.message);
  }
  await client.end();
}

run();
