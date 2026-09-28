import { cn } from '@/lib/utils'

interface ProjectSubpageShellProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function ProjectSubpageShell({ children, className, contentClassName }: ProjectSubpageShellProps) {
  return (
    <section className={cn('relative overflow-hidden border border-white/10 bg-[#02060c]', className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:34px_34px] opacity-35" />
      <div className="pointer-events-none absolute -top-56 left-1/2 h-[28rem] w-[145%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.33)_0%,rgba(0,229,255,0.1)_42%,rgba(0,0,0,0)_75%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.12)_0%,rgba(0,229,255,0.03)_42%,rgba(0,0,0,0.8)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 border-b border-cyan-400/15 bg-cyan-400/5" />
      <div className={cn('relative p-3 sm:p-4 md:p-5', contentClassName)}>{children}</div>
    </section>
  )
}
