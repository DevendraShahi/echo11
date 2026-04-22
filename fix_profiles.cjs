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
  const profileIds = new Set(profiles.map(p => p.id));
  
  for (const u of users.users) {
    if (!profileIds.has(u.id)) {
      console.log(`Inserting missing profile for ${u.email}...`);
      const { error } = await supabase.from('profiles').insert({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || u.email.split('@')[0],
        role: 'admin' // or whatever default
      });
      if (error) {
        console.error(`Error inserting profile for ${u.email}:`, error);
      } else {
        console.log(`Profile for ${u.email} created.`);
      }
    }
  }
}

run();
