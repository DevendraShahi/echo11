import { AppFeedbackProvider } from '@/components/ui/AppFeedbackProvider'

export default function LabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppFeedbackProvider>{children}</AppFeedbackProvider>
}
