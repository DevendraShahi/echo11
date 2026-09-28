'use client'

import { useLabNavigation } from './LabNavigationContext'

export function LabMobileSidebarOverlay() {
  const { isSidebarOpen, closeSidebar } = useLabNavigation()

  if (!isSidebarOpen) return null

  return (
    <button
      type="button"
      aria-label="Close sidebar"
      onClick={closeSidebar}
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
    />
  )
}
