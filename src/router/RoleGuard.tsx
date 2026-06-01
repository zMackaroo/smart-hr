import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../types/auth.types'
import { useAuthStore } from '../store/authStore'

interface RoleGuardProps {
  roles: UserRole[]
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
