const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error(usersError);
    return;
  }
  
  const { data: profiles, error: profError } = await supabase.from('profiles').select('id');
  
  console.log("Users in auth.users:");
  for (let u of users.users) {
    console.log("-", u.id, u.email);
  }
  
  console.log("\nUsers in profiles:");
  for (let p of profiles) {
    console.log("-", p.id);
  }
}

run();
