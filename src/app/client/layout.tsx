import type { Metadata } from 'next'
import { AppFeedbackProvider } from '@/components/ui/AppFeedbackProvider'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppFeedbackProvider>{children}</AppFeedbackProvider>
}
