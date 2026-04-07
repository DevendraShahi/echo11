'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  icon?: boolean
}

export function SearchInput({ value, onChange, placeholder = "Search...", className, icon = true }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      {icon && (
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-white/[0.03] border border-white/10 rounded-none text-white text-sm",
          "placeholder:text-white/30",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
          "hover:bg-white/[0.05] transition-colors",
          "font-sans",
          icon ? "pl-11 pr-10" : "pl-4",
          "py-2.5 w-full"
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-none transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/40" />
        </button>
      )}
    </div>
  )
}
