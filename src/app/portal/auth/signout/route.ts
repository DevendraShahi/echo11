import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/portal/auth/login', new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://echo11.tech').origin))
}
