import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThemeProvider } from '@/components/layout/lab/ThemeProvider'
import { Theme } from '@/types/lab'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/lab/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'client') {
    redirect('/client')
  }

  if (profile?.role !== 'admin' && profile?.role !== 'member') {
    redirect('/lab/auth/login')
  }

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('theme')
    .eq('user_id', user.id)
    .single()

  const theme = (preferences?.theme || 'dark') as Theme

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-background font-sans overflow-hidden">
        
        {/* Custom Docs Sidebar / Reader Theme */}
        <aside className="w-72 bg-black/50 backdrop-blur-md border-r border-white/5 flex flex-col pt-6 font-sans shrink-0 hidden md:flex">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-accent/10 flex items-center justify-center border border-accent/20">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Echo11 Docs</h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3 px-2">Onboarding Guide</h3>
              <ul className="space-y-1">
                <li><a href="#dashboard" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Dashboard & Feed</a></li>
                <li><a href="#clients" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Clients & Teams</a></li>
                <li><a href="#projects" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Projects & Milestones</a></li>
                <li><a href="#tasks" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Tasks & Meetings</a></li>
                <li><a href="#documents" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Documents & Notes</a></li>
                <li><a href="#invoices" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Invoices & Contracts</a></li>
                <li><a href="#settings" className="block px-2 py-1.5 text-sm font-medium text-white/60 hover:text-accent transition-colors">Settings & Profile</a></li>
              </ul>
            </div>
          </nav>
          
          <div className="p-4 border-t border-white/5 bg-black/20">
            <Link 
              href="/lab/dashboard" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white hover:bg-white/5 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 text-accent" />
              Return to Lab
            </Link>
          </div>
        </aside>

        {/* Reader Document Area */}
        <main className="flex-1 flex flex-col bg-background/95 h-full overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto p-8 pt-12 pb-32">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
