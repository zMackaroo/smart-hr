import type { ReactNode } from 'react'
import { usePermission } from '../../hooks/usePermission'
import type { PermissionAction, PermissionModule } from '../../types/permission.types'

interface PermissionGateProps {
  module: PermissionModule
  action?: PermissionAction
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  module,
  action = 'view',
  children,
  fallback = null,
}: PermissionGateProps) {
  const { canModule, isSuperAdmin } = usePermission()

  if (isSuperAdmin || canModule(module, action)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
