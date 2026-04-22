const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || '';

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  const data = await res.json();
  console.log("Profiles in DB:", data.length);
  // Also get the current user ID we expect. We can't know which user, but we can see all profiles.
  console.log(data);
}
run().catch(console.error);
