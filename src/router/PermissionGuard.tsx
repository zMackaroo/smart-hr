import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePermission } from '../hooks/usePermission'
import { useNotificationStore } from '../store/notificationStore'
import type { PermissionAction, PermissionModule } from '../types/permission.types'

interface PermissionGuardProps {
  module: PermissionModule
  action?: PermissionAction
}

export function PermissionGuard({ module, action = 'view' }: PermissionGuardProps) {
  const location = useLocation()
  const { canModule, isSuperAdmin } = usePermission()
  const addNotification = useNotificationStore((state) => state.addNotification)
  const notifiedRef = useRef(false)

  const allowed = isSuperAdmin || canModule(module, action)

  useEffect(() => {
    if (allowed) {
      notifiedRef.current = false
      return
    }

    if (!notifiedRef.current) {
      addNotification('error', "You don't have permission to access this page")
      notifiedRef.current = true
    }
  }, [addNotification, allowed])

  if (!allowed) {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
