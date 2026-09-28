import { notFound } from 'next/navigation'
import { getProjectWorkspace } from '@/features/lab/workspace/data'
import { ProjectWorkspaceTabs } from './ProjectWorkspaceTabs'

export default async function ProjectWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="relative space-y-4 pb-4 sm:space-y-5">
      <section className="relative border border-white/10 bg-[#03070d]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
        <div className="pointer-events-none absolute -top-44 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.34)_0%,rgba(0,229,255,0.11)_40%,rgba(0,0,0,0)_74%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.11)_0%,rgba(0,229,255,0.03)_38%,rgba(0,0,0,0.74)_100%)]" />
        <div className="relative p-2 sm:p-3">
          <ProjectWorkspaceTabs projectId={id} />
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.1)_0%,rgba(0,0,0,0)_68%)]" />
        {children}
      </div>
    </div>
  )
}
