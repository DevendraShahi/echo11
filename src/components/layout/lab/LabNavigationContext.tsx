'use client'

import { createContext, useContext, useMemo, useState } from 'react'

interface LabNavigationContextValue {
  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const LabNavigationContext = createContext<LabNavigationContextValue | null>(null)

export function LabNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = useMemo<LabNavigationContextValue>(
    () => ({
      isSidebarOpen,
      openSidebar: () => setIsSidebarOpen(true),
      closeSidebar: () => setIsSidebarOpen(false),
      toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    }),
    [isSidebarOpen]
  )

  return <LabNavigationContext.Provider value={value}>{children}</LabNavigationContext.Provider>
}

export function useLabNavigation() {
  const context = useContext(LabNavigationContext)
  if (!context) {
    throw new Error('useLabNavigation must be used inside LabNavigationProvider')
  }
  return context
}
