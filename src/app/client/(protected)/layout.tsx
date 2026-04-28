import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { ClientNotifications } from './ClientNotifications'
import { ClientNavigation } from './ClientNavigation'
import { getClientUnreadTeamMessagesCount } from '@/lib/actions/client-message-actions'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/client/auth/login')
  }

  let clientRecord: { id: string; company_name: string; contact_name: string | null; auth_id: string | null } | null = null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin' || profile?.role === 'member') {
    redirect('/lab/dashboard')
  }

  if (profile?.role !== 'client') {
    redirect('/client/auth/login')
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, contact_name, auth_id')
    .eq('auth_id', user.id)
    .single()
  clientRecord = client

  if (!clientRecord) {
    redirect('/client/auth/login')
  }

  const unreadMessageCount = await getClientUnreadTeamMessagesCount()

  return (
    <div className="min-h-screen bg-black font-sans">
      {/* Client Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/client" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent flex items-center justify-center">
                <span className="text-black font-bold text-lg font-mono">e</span>
              </div>
              <div>
                <h1 className="text-white font-semibold font-sans">echo11</h1>
                <p className="text-white/40 text-xs font-mono">Client Area</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {clientRecord && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 text-sm font-mono">{clientRecord.company_name}</span>
                </div>
              )}
              <ClientNotifications />
              <form action="/client/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/5 border border-white/10 transition-colors text-sm font-mono"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <ClientNavigation initialUnreadMessageCount={unreadMessageCount} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
