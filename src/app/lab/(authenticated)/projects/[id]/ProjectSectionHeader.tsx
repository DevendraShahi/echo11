import Link from 'next/link'
import { ArrowLeft, Building2, Calendar, LucideIcon } from 'lucide-react'
import { ProjectWorkspaceProject } from '@/features/lab/workspace/data'

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'No date'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No date'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

function getDeadlineLabel(deadline: string | null | undefined) {
  if (!deadline) return { label: 'No deadline', tone: 'text-white/55' }

  const now = Date.now()
  const end = new Date(deadline).getTime()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: 'text-rose-300' }
  if (diff === 0) return { label: 'Due today', tone: 'text-amber-300' }
  if (diff <= 3) return { label: `${diff}d left`, tone: 'text-amber-300' }
  return { label: `${diff}d left`, tone: 'text-emerald-300' }
}

interface ProjectSectionHeaderProps {
  project: ProjectWorkspaceProject
  title: string
  subtitle?: string
  icon: LucideIcon
  action?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function ProjectSectionHeader({
  project,
  title,
  subtitle,
  icon: Icon,
  action,
  backHref = '/lab/projects',
  backLabel = 'Back to Projects',
}: ProjectSectionHeaderProps) {
  const deadlineMeta = getDeadlineLabel(project.deadline)

  return (
    <header className="relative overflow-hidden border border-white/10 bg-[#03070d]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[136%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.32)_0%,rgba(0,229,255,0.1)_40%,rgba(0,0,0,0)_74%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.08)_0%,rgba(0,0,0,0)_50%,rgba(0,0,0,0.78)_100%)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/50 hover:text-accent font-mono">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        {action ? <div>{action}</div> : null}
      </div>

      <div className="relative flex flex-col gap-4 px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-accent/35 bg-accent/10">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[1.55rem] text-foreground font-sans tracking-tight sm:text-[1.75rem]">{title}</h1>
            <p className="mt-1 text-sm text-white/65 font-sans leading-relaxed">
              {subtitle || project.description || 'Project operations workspace'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:border-none sm:bg-transparent">
          <span className="inline-flex items-center gap-1 border border-white/15 bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono">
            <Building2 className="h-3 w-3 text-accent/85" />
            {project.client?.company_name || 'No client linked'}
          </span>
          <span className={`inline-flex items-center gap-1 border border-white/15 bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono ${deadlineMeta.tone}`}>
            <Calendar className="h-3 w-3" />
            {deadlineMeta.label}
          </span>
          <span className="inline-flex items-center border border-white/15 bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono">
            {project.status.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center border border-white/15 bg-black/55 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono">
            {formatDateLabel(project.deadline)}
          </span>
        </div>
      </div>
    </header>
  )
}
