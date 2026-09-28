import { redirect } from 'next/navigation'

export default async function ProjectMilestonesLegacyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/lab/projects/${id}/delivery`)
}
