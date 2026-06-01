import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../types/auth.types'
import { useAuthStore } from '../store/authStore'

interface RoleGuardProps {
  roles: UserRole[]
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/dashboard" replace />
  }

  if (user.customRoleId) {
    const superAdminOnly = roles.length === 1 && roles[0] === 'super_admin'
    if (superAdminOnly) {
      return <Navigate to="/dashboard" replace />
    }
    return <Outlet />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
