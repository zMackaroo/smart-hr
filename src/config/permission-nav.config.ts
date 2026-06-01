import type { PermissionAction, PermissionModule } from '../types/permission.types'

export interface NavPermissionRequirement {
  module: PermissionModule
  action?: PermissionAction
}

export const NAV_PERMISSION_MAP: Record<string, NavPermissionRequirement> = {
  '/dashboard': { module: 'dashboard', action: 'view' },
  '/employees': { module: 'employees', action: 'view' },
  '/departments': { module: 'departments', action: 'view' },
  '/designations': { module: 'departments', action: 'view' },
  '/org-chart': { module: 'employees', action: 'view' },
  '/attendance': { module: 'attendance', action: 'view' },
  '/leaves': { module: 'leaves', action: 'view' },
  '/payroll/salary': { module: 'payroll', action: 'view' },
  '/payroll/payslip': { module: 'payroll', action: 'view' },
  '/payroll/provident': { module: 'payroll', action: 'view' },
  '/payroll/expenses': { module: 'expenses', action: 'view' },
  '/payroll/bank-accounts': { module: 'bank_accounts', action: 'view' },
  '/recruitment/jobs': { module: 'recruitment', action: 'view' },
  '/recruitment/candidates': { module: 'recruitment', action: 'view' },
  '/recruitment/referrals': { module: 'recruitment', action: 'view' },
  '/tickets': { module: 'tickets', action: 'view' },
  '/projects': { module: 'projects', action: 'view' },
  '/tasks': { module: 'projects', action: 'view' },
  '/reports': { module: 'reports', action: 'view' },
  '/settings/company': { module: 'settings', action: 'view' },
  '/settings/roles': { module: 'settings', action: 'view' },
  '/settings/users': { module: 'settings', action: 'view' },
}

export function getNavPermissionForHref(href: string): NavPermissionRequirement | undefined {
  return NAV_PERMISSION_MAP[href]
}
