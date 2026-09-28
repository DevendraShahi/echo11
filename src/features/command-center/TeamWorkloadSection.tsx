import { cn } from '@/lib/utils'
import type { TeamWorkloadSummary } from '@/lib/frontend/view-models'

interface TeamWorkloadSectionProps {
  members: TeamWorkloadSummary[]
}

const capacityColors: Record<string, { color: string; bg: string; border: string; label: string }> = {
  normal: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Normal' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'High' },
  overloaded: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Overloaded' },
  blocked: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Blocked' },
}

export function TeamWorkloadSection({ members }: TeamWorkloadSectionProps) {
  if (members.length === 0) {
    return (
      <div className="p-8 bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-white/50 font-sans">No team members</p>
        <p className="text-xs text-white/30 font-mono mt-1">Add team members to see workload</p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white">Team Workload</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/20 text-white/70 rounded-sm">
            {members.length}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/5 text-white/40 uppercase tracking-wider">
              <th className="text-left px-4 py-2 font-semibold">Member</th>
              <th className="text-center px-3 py-2 font-semibold">Open</th>
              <th className="text-center px-3 py-2 font-semibold">Overdue</th>
              <th className="text-center px-3 py-2 font-semibold">In Progress</th>
              <th className="text-center px-3 py-2 font-semibold">Blocked</th>
              <th className="text-right px-4 py-2 font-semibold">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member) => {
              const capacity = capacityColors[member.capacity]

              return (
                <tr key={member.memberId} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-sans">{member.name}</p>
                    <p className="text-[10px] text-white/30">{member.role}</p>
                  </td>
                  <td className="text-center px-3 py-3 text-white/60">{member.openTasks}</td>
                  <td className={cn('text-center px-3 py-3', member.overdueTasks > 0 ? 'text-rose-400' : 'text-white/60')}>
                    {member.overdueTasks}
                  </td>
                  <td className="text-center px-3 py-3 text-white/60">{member.inProgress}</td>
                  <td className={cn('text-center px-3 py-3', member.blocked > 0 ? 'text-rose-400' : 'text-white/60')}>
                    {member.blocked}
                  </td>
                  <td className="text-right px-4 py-3">
                    <span className={cn('px-1.5 py-0.5 text-[10px] font-mono uppercase border rounded-sm', capacity.color, capacity.bg, capacity.border)}>
                      {capacity.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
