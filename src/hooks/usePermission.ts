import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/auth.types'

export type PermissionAction =
  | 'view_settings'
  | 'manage_employees'
  | 'manage_departments'
  | 'manage_payroll'
  | 'manage_recruitment'
  | 'view_reports'
  | 'manage_org'

const ACTION_ROLES: Record<PermissionAction, UserRole[]> = {
  view_settings: ['super_admin'],
  manage_employees: ['super_admin', 'hr_admin'],
  manage_departments: ['super_admin', 'hr_admin'],
  manage_payroll: ['super_admin', 'hr_admin'],
  manage_recruitment: ['super_admin', 'hr_admin'],
  view_reports: ['super_admin', 'hr_admin'],
  manage_org: ['super_admin'],
}

export function usePermission() {
  const user = useAuthStore((state) => state.user)
  const role: UserRole = user?.role ?? 'employee'

  return {
    role,
    isAdmin: role === 'super_admin' || role === 'hr_admin',
    isSuperAdmin: role === 'super_admin',
    isEmployee: role === 'employee',
    can: (action: PermissionAction) => ACTION_ROLES[action].includes(role),
  }
}
