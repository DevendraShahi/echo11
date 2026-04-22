import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderKanban, FileText, LogOut, User, Settings, ScrollText, MessageSquare } from 'lucide-react'
import { PortalNotifications } from './PortalNotifications'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  // Check if user has client role or is linked to a client
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If user is a client team member, get their client record
  let clientRecord = null
  if (profile?.role === 'client') {
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('auth_id', user.id)
      .single()
    clientRecord = client
  }

  // If not a client and not an admin/member, deny access
  if (profile?.role !== 'admin' && profile?.role !== 'member' && profile?.role !== 'client') {
    redirect('/portal/auth/login')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Portal Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portal" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent flex items-center justify-center">
                <span className="text-black font-bold text-lg font-mono">e</span>
              </div>
              <div>
                <h1 className="text-white font-semibold font-sans">echo11</h1>
                <p className="text-white/40 text-xs font-mono">Client Portal</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {clientRecord && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-white/50" />
                  <span className="text-white/70 text-sm font-mono">{clientRecord.company_name}</span>
                </div>
              )}
              <PortalNotifications />
              <form action="/auth/signout" method="post">
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

      {/* Portal Navigation */}
      <nav className="border-b border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <Link 
              href="/portal" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              href="/portal/projects" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <FolderKanban className="w-4 h-4" />
              Projects
            </Link>
            <Link 
              href="/portal/invoices" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <FileText className="w-4 h-4" />
              Invoices
            </Link>
            <Link 
              href="/portal/settings" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link 
              href="/portal/contracts" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <ScrollText className="w-4 h-4" />
              Contracts
            </Link>
            <Link 
              href="/portal/messages" 
              className="flex items-center gap-2 px-4 py-3 text-white/60 hover:text-accent hover:bg-white/5 border-b-2 border-transparent hover:border-accent transition-colors text-sm font-mono"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
