'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { LabPermissions } from '@/lib/frontend/permissions'

const PermissionsContext = createContext<LabPermissions | null>(null)

export function PermissionsProvider({ permissions, children }: { permissions: LabPermissions; children: ReactNode }) {
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions(): LabPermissions {
  const ctx = useContext(PermissionsContext)
  if (!ctx) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return ctx
}

interface PermissionGateProps {
  allowed: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ allowed, children, fallback }: PermissionGateProps) {
  if (!allowed) {
    return fallback ? <>{fallback}</> : null
  }
  return <>{children}</>
}

interface PermissionGatePathProps {
  path: keyof LabPermissions
  action: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGatePath({ path, action, children, fallback }: PermissionGatePathProps) {
  const permissions = usePermissions()
  const section = permissions[path]
  const allowed = section?.[action as keyof typeof section] === true

  if (!allowed) {
    return fallback ? <>{fallback}</> : null
  }
  return <>{children}</>
}
