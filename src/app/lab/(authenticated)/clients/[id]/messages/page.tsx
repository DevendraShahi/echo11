import { redirect } from 'next/navigation'

export default async function ClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/lab/messages?client=${id}`)
}
