'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search, Check } from 'lucide-react'
import { clsx } from 'clsx'

export interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
  color?: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  disabled?: boolean
  className?: string
  error?: string
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  searchable = false,
  multiple = false,
  disabled = false,
  className = '',
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5',
          'bg-white/5 border rounded-lg text-left transition-all',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-white/20 cursor-pointer',
          error 
            ? 'border-red-500/50 focus:ring-red-500/50' 
            : 'border-white/10'
        )}
      >
        <span className={clsx(
          'truncate',
          selectedOption ? 'text-foreground' : 'text-white/40'
        )}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && (
                <span className="flex-shrink-0">{selectedOption.icon}</span>
              )}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={clsx(
          'w-4 h-4 text-white/40 transition-transform duration-200 flex-shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2">
          {/* Search input */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-t-lg text-foreground placeholder:text-white/30 focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {/* Options list */}
          <div className={clsx(
            'bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden',
            'max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
          )}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-white/40 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 px-4 py-3 text-left',
                    'hover:bg-white/10 transition-colors',
                    value === option.value && 'bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && (
                      <span className="flex-shrink-0 text-white/50">{option.icon}</span>
                    )}
                    <span className="text-foreground">{option.label}</span>
                    {option.description && (
                      <span className="text-white/40 text-xs ml-1">({option.description})</span>
                    )}
                  </span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

interface MultiSelectDropdownProps {
  options: DropdownOption[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  className?: string
}

export function MultiSelectDropdown({
  options,
  values,
  onChange,
  placeholder = 'Select options',
  searchable = false,
  disabled = false,
  className = '',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  const selectedOptions = options.filter(opt => values.includes(opt.value))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue))
    } else {
      onChange([...values, optionValue])
    }
  }

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5',
          'bg-white/5 border rounded-lg text-left transition-all',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-white/20 cursor-pointer',
          'border-white/10'
        )}
      >
        <span className={clsx(
          'truncate',
          selectedOptions.length > 0 ? 'text-foreground' : 'text-white/40'
        )}>
          {selectedOptions.length > 0
            ? selectedOptions.map(o => o.label).join(', ')
            : placeholder}
        </span>
        <ChevronDown className={clsx(
          'w-4 h-4 text-white/40 transition-transform duration-200 flex-shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-t-lg text-foreground placeholder:text-white/30 focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div className={clsx(
            'bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden',
            'max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
          )}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-white/40 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 px-4 py-3 text-left',
                    'hover:bg-white/10 transition-colors',
                    values.includes(option.value) && 'bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <div className={clsx(
                      'w-4 h-4 border rounded flex items-center justify-center',
                      values.includes(option.value)
                        ? 'bg-accent border-accent'
                        : 'border-white/30'
                    )}>
                      {values.includes(option.value) && (
                        <Check className="w-3 h-3 text-black" />
                      )}
                    </div>
                    <span className="text-foreground">{option.label}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
