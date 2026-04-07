import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LabSidebar } from '@/components/layout/lab/LabSidebar'
import { LabHeader } from '@/components/layout/lab/LabHeader'
import { LabFooter } from '@/components/layout/lab/LabFooter'
import { ThemeProvider } from '@/components/layout/lab/ThemeProvider'
import { WelcomeModal } from '@/components/onboarding'
import { Theme } from '@/types/lab'

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

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('theme')
    .eq('user_id', user.id)
    .single()

  const theme = (preferences?.theme || 'dark') as Theme

  return (
    <ThemeProvider theme={theme}>
      <WelcomeModal />
      <div className="flex h-screen bg-background font-sans">
        <LabSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-none">
            <LabHeader />
          </div>
          <main className="flex-1 overflow-y-auto bg-background font-sans">
            <div className="px-6 pb-14 min-h-full">
              {children}
            </div>
          </main>
          <div className="flex-none">
            <LabFooter />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
