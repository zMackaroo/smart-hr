import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types/auth.types'

export function useDashboardPageViewModel() {
  const user = useAuthStore((state) => state.user)
  const role: UserRole = user?.role ?? 'employee'
  const isAdmin = role === 'super_admin' || role === 'hr_admin'

  return { role, isAdmin }
}
