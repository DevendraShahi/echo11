const { Client } = require('pg');

const connectionString = 'postgresql://postgres.hwddfqgxmdhsmjzydywz:EIHIti0ogBCW45ZW@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
  connectionString,
});

async function run() {
  await client.connect();
  const queries = [
    `ALTER TABLE invoices ADD COLUMN target_currency text;`,
    `ALTER TABLE invoices ADD COLUMN exchange_rate numeric;`,
    `ALTER TABLE invoices ADD COLUMN converted_total numeric;`,
    `ALTER TABLE invoices ADD COLUMN conversion_date timestamptz;`
  ];
  for (const q of queries) {
     try {
       await client.query(q);
       console.log('Success:', q);
     } catch (err) {
       console.log('Error or exists:', err.message);
     }
  }
  await client.end();
}

run();
