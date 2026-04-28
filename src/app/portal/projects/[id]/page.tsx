import { redirect } from 'next/navigation'

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/client/projects/${id}`)
}
