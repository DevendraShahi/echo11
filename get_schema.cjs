const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  if (error) {
    console.error("RPC failed, let's try reading information_schema...");
    // we can't query information_schema easily via anon key, but let's try taking a guess 
    // or just omit created_by and see if it inserts successfully.
    console.log("No direct access. But we can omit created_by in an insert.");
  } else {
    console.log(data);
  }
}
main();
