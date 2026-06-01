import { useQuery } from '@tanstack/react-query'
import {
  getDefaultEffectivePermissions,
  getEffectivePermissions,
  PERMISSIONS_QUERY_KEY,
} from '../api/permissions.api'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/auth.types'
import type { PermissionAction, PermissionModule } from '../types/permission.types'

export type LegacyPermissionAction =
  | 'view_settings'
  | 'manage_employees'
  | 'manage_departments'
  | 'manage_payroll'
  | 'manage_recruitment'
  | 'view_reports'
  | 'manage_org'

const ACTION_ROLES: Record<LegacyPermissionAction, UserRole[]> = {
  view_settings: ['super_admin'],
  manage_employees: ['super_admin', 'hr_admin'],
  manage_departments: ['super_admin', 'hr_admin'],
  manage_payroll: ['super_admin', 'hr_admin'],
  manage_recruitment: ['super_admin', 'hr_admin'],
  view_reports: ['super_admin', 'hr_admin'],
  manage_org: ['super_admin'],
}

function legacyCan(
  action: LegacyPermissionAction,
  role: UserRole,
  customRoleId: string | undefined,
  canModule: (module: PermissionModule, action: PermissionAction) => boolean,
): boolean {
  if (role === 'super_admin' && !customRoleId) {
    return ACTION_ROLES[action].includes('super_admin')
  }

  switch (action) {
    case 'view_settings':
      return canModule('settings', 'view')
    case 'manage_employees':
      return (
        canModule('employees', 'view') &&
        (canModule('employees', 'create') || canModule('employees', 'edit'))
      )
    case 'manage_departments':
      return (
        canModule('departments', 'view') &&
        (canModule('departments', 'create') || canModule('departments', 'edit'))
      )
    case 'manage_payroll':
      return (
        canModule('payroll', 'view') &&
        (canModule('payroll', 'create') || canModule('payroll', 'edit'))
      )
    case 'manage_recruitment':
      return (
        canModule('recruitment', 'view') &&
        (canModule('recruitment', 'create') || canModule('recruitment', 'edit'))
      )
    case 'view_reports':
      return canModule('reports', 'view')
    case 'manage_org':
      return canModule('departments', 'view') && canModule('employees', 'view')
    default:
      return false
  }
}

export function usePermission() {
  const user = useAuthStore((state) => state.user)
  const role: UserRole = user?.role ?? 'employee'
  const customRoleId = user?.customRoleId

  const { data: effectivePermissions } = useQuery({
    queryKey: [...PERMISSIONS_QUERY_KEY, 'effective', role, customRoleId ?? 'system'],
    queryFn: () => getEffectivePermissions(role, customRoleId),
  })

  const permissions =
    effectivePermissions ?? getDefaultEffectivePermissions(role, customRoleId)

  const canModule = (module: PermissionModule, action: PermissionAction): boolean => {
    if (role === 'super_admin' && !customRoleId) return true
    return permissions[module]?.includes(action) ?? false
  }

  const canViewModule = (module: PermissionModule): boolean => canModule(module, 'view')

  const canEditModule = (module: PermissionModule): boolean =>
    canModule(module, 'create') || canModule(module, 'edit')

  const canApproveModule = (module: PermissionModule): boolean => canModule(module, 'approve')

  const hasCustomRole = Boolean(customRoleId)

  return {
    role,
    customRoleId,
    hasCustomRole,
    isAdmin:
      (role === 'super_admin' && !customRoleId) ||
      (role === 'hr_admin' && !customRoleId) ||
      hasCustomRole,
    isSuperAdmin: role === 'super_admin' && !customRoleId,
    isEmployee: role === 'employee' && !customRoleId,
    canModule,
    canViewModule,
    canEditModule,
    canApproveModule,
    can: (action: LegacyPermissionAction) =>
      legacyCan(action, role, customRoleId, canModule),
  }
}

export { PERMISSIONS_QUERY_KEY }
