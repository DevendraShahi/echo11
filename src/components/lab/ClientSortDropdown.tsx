'use client'

import { ArrowUpDown } from 'lucide-react'

export type SortOption = 'name' | 'recent' | 'projects'

interface ClientSortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

export function ClientSortDropdown({ value, onChange, className }: ClientSortDropdownProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowUpDown className="w-4 h-4 text-white/40" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3.5 py-2.5 bg-white/[0.03] border border-white/10 rounded-none text-white text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:bg-white/[0.05] transition-colors appearance-none pr-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
        }}
      >
        <option value="recent" className="bg-black text-white">Most Recent</option>
        <option value="name" className="bg-black text-white">Name (A-Z)</option>
        <option value="projects" className="bg-black text-white">Most Projects</option>
      </select>
    </div>
  )
}
