import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LabSidebar } from '@/components/layout/lab/LabSidebar'
import { LabHeader } from '@/components/layout/lab/LabHeader'
import { LabFooter } from '@/components/layout/lab/LabFooter'
import { ThemeProvider } from '@/components/layout/lab/ThemeProvider'
import { LabNavigationProvider } from '@/components/layout/lab/LabNavigationContext'
import { LabMobileSidebarOverlay } from '@/components/layout/lab/LabMobileSidebarOverlay'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { Theme } from '@/types/lab'
import { getTeamUnreadClientMessagesCount } from '@/lib/actions/client-message-actions'

export default async function AuthenticatedLayout({
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
  const unreadClientMessagesCount = await getTeamUnreadClientMessagesCount()

  return (
    <ThemeProvider theme={theme}>
      <WelcomeModal />
      <LabNavigationProvider>
        <div className="flex h-screen bg-background font-sans">
          <LabSidebar initialUnreadClientMessagesCount={unreadClientMessagesCount} />
          <LabMobileSidebarOverlay />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-none">
              <LabHeader initialUnreadClientMessagesCount={unreadClientMessagesCount} />
            </div>
            <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_0%_0%,rgba(0,229,255,0.08),transparent_35%),#020202] font-sans">
              <div className="px-4 py-5 pb-16 lg:px-6 min-h-full">
                {children}
              </div>
            </main>
            <div className="flex-none">
              <LabFooter />
            </div>
          </div>
        </div>
      </LabNavigationProvider>
    </ThemeProvider>
  )
}
