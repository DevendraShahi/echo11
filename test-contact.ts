import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: clients } = await supabase.from('clients').select('id').limit(1)
  if (!clients || clients.length === 0) {
    console.log("No clients found")
    return
  }
  
  const client_id = clients[0].id
  
  const res = await supabase.from('client_contacts').insert({
    client_id,
    name: 'Test Contact',
    email: 'test@example.com',
    role: null
  }).select()
  
  console.log("Result:", res)
}

test()
