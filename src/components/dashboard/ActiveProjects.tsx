'use client'

import Link from 'next/link'
import { format, isPast, isWithinInterval, addDays } from 'date-fns'
import { Clock, ArrowRight, FolderKanban } from 'lucide-react'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { Project, ProjectStatus } from '@/types/lab'

interface ActiveProjectsProps {
  projects?: Project[]
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  on_hold: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  archived: { bg: 'bg-white/5', text: 'text-white/50', dot: 'bg-white/30' },
}

function getDeadlineStatus(deadline: string | null) {
  if (!deadline) return { label: 'No deadline', className: 'text-white/30' }
  
  const deadlineDate = new Date(deadline)
  const now = new Date()
  
  if (isPast(deadlineDate)) {
    return { label: 'Overdue', className: 'text-rose-400' }
  }
  
  if (isWithinInterval(deadlineDate, { start: now, end: addDays(now, 7) })) {
    return { label: `Due ${format(deadlineDate, 'MMM d')}`, className: 'text-amber-400' }
  }
  
  return { label: format(deadlineDate, 'MMM d, yyyy'), className: 'text-white/40' }
}

export function ActiveProjects({ projects: initialProjects }: ActiveProjectsProps) {
  const projects = initialProjects || [
    { id: '1', name: 'TrueLuxe Website', status: 'active' as ProjectStatus, progress: 75, deadline: addDays(new Date(), 5).toISOString(), color: '#00E5FF' },
    { id: '2', name: 'Prika Mobile App', status: 'active' as ProjectStatus, progress: 45, deadline: addDays(new Date(), 12).toISOString(), color: '#10b981' },
    { id: '3', name: 'Leaders NP', status: 'active' as ProjectStatus, progress: 90, deadline: addDays(new Date(), 2).toISOString(), color: '#f59e0b' },
    { id: '4', name: 'Green Lifestyle', status: 'on_hold' as ProjectStatus, progress: 30, deadline: null, color: '#ec4899' },
  ]

  return (
    <LabCard>
      <LabCardHeader className="flex flex-row items-center justify-between pb-2">
        <LabCardTitle className="text-lg font-semibold">Active Projects</LabCardTitle>
        <Link href="/lab/projects" className="text-sm text-accent hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </LabCardHeader>
      <LabCardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No active projects</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const deadline = getDeadlineStatus(project.deadline)
              const colors = statusColors[project.status]
              
              return (
                <Link
                  key={project.id}
                  href={`/lab/projects/${project.id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-4 p-3 rounded-none hover:bg-white/5 transition-colors">
                    <div 
                      className="w-1 h-12 rounded-none"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground truncate">
                          {project.name}
                        </h4>
                        <div className={`w-2 h-2 rounded-none ${colors.dot}`} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-none overflow-hidden">
                          <div 
                            className="h-full rounded-none transition-all duration-300"
                            style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                          />
                        </div>
                        <span className="text-sm font-medium text-white/50 w-10">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${deadline.className}`}>
                      <Clock className="w-3 h-3" />
                      {deadline.label}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </LabCardContent>
    </LabCard>
  )
}
