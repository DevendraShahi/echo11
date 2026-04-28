import { AppFeedbackProvider } from '@/components/ui/AppFeedbackProvider'

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppFeedbackProvider>{children}</AppFeedbackProvider>
}
