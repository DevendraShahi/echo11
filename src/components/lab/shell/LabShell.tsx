'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface SidebarContextValue {
  sidebarOpen: boolean
  isMobile: boolean
  toggle: () => void
  close: () => void
  open: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebarContext must be used within LabShell')
  }
  return ctx
}

interface LabShellProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  topbar: React.ReactNode
  footer?: React.ReactNode
}

export function LabShell({ children, sidebar, topbar, footer }: LabShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggle = () => setSidebarOpen(prev => !prev)
  const close = () => setSidebarOpen(false)
  const open = () => setSidebarOpen(true)

  const ctx: SidebarContextValue = { sidebarOpen, isMobile, toggle, close, open }

  return (
    <SidebarContext.Provider value={ctx}>
      <div className="flex h-screen bg-background font-sans overflow-hidden">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out',
            isMobile
              ? sidebarOpen
                ? 'translate-x-0 w-72'
                : '-translate-x-full w-72'
              : sidebarOpen
                ? 'w-72'
                : 'w-16'
          )}
        >
          {sidebar}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <div className="flex-none">
            {topbar}
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="px-4 sm:px-6 lg:px-8 pb-14 min-h-full">
              {children}
            </div>
          </main>

          {/* Footer */}
          {footer && (
            <div className="flex-none">
              {footer}
            </div>
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
