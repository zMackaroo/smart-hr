import { z } from 'zod'
import type { UserRole } from './auth.types'

export type PermissionModule =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'recruitment'
  | 'tickets'
  | 'reports'
  | 'settings'
  | 'expenses'
  | 'bank_accounts'
  | 'projects'

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve'

export type RoleSlug = 'super_admin' | 'hr_admin' | 'employee'

export const SYSTEM_ROLE_IDS: Record<RoleSlug, string> = {
  super_admin: 'role-super-admin',
  hr_admin: 'role-hr-admin',
  employee: 'role-employee',
}

export const PERMISSION_MODULES = [
  'dashboard',
  'employees',
  'departments',
  'attendance',
  'leaves',
  'payroll',
  'recruitment',
  'tickets',
  'reports',
  'settings',
  'expenses',
  'bank_accounts',
  'projects',
] as const satisfies readonly PermissionModule[]

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
] as const satisfies readonly PermissionAction[]

export const RolePermissionSchema = z.object({
  module: z.enum(PERMISSION_MODULES),
  actions: z.object({
    view: z.boolean(),
    create: z.boolean(),
    edit: z.boolean(),
    delete: z.boolean(),
    approve: z.boolean(),
  }),
})

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  isSystem: z.boolean(),
  userCount: z.number(),
  permissions: z.array(RolePermissionSchema),
  updatedAt: z.string(),
})

export const UpdateRolePermissionsSchema = z.object({
  permissions: z.array(RolePermissionSchema),
})

export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  cloneFromRoleId: z.string().min(1, 'Select a role to clone permissions from'),
})

export type RolePermission = z.infer<typeof RolePermissionSchema>
export type Role = z.infer<typeof RoleSchema>
export type UpdateRolePermissionsInput = z.infer<typeof UpdateRolePermissionsSchema>
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>

export type EffectivePermissions = Record<PermissionModule, PermissionAction[]>

export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  attendance: 'Attendance',
  leaves: 'Leaves',
  payroll: 'Payroll',
  recruitment: 'Recruitment',
  tickets: 'Tickets',
  reports: 'Reports',
  settings: 'Settings',
  expenses: 'Expenses',
  bank_accounts: 'Bank Accounts',
  projects: 'Projects',
}

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
}

const APPROVE_MODULES: PermissionModule[] = ['leaves', 'expenses', 'tickets', 'recruitment']

export function isSystemRoleSlug(slug: string): slug is RoleSlug {
  return slug === 'super_admin' || slug === 'hr_admin' || slug === 'employee'
}

export function isCustomRoleSlug(slug: string): boolean {
  return slug.startsWith('custom-')
}

export function resolveUserRoleId(user: { role: UserRole; customRoleId?: string }): string {
  return user.customRoleId ?? SYSTEM_ROLE_IDS[user.role]
}

export function matchesRoleFilter(
  user: { role: UserRole; customRoleId?: string },
  roleFilter: string,
): boolean {
  if (!roleFilter) return true
  return resolveUserRoleId(user) === roleFilter
}

export function isActionApplicable(
  module: PermissionModule,
  action: PermissionAction,
): boolean {
  if (action === 'approve') {
    return APPROVE_MODULES.includes(module)
  }
  if (module === 'dashboard' || module === 'reports') {
    return action === 'view'
  }
  return true
}

export function clonePermissions(permissions: RolePermission[]): RolePermission[] {
  return permissions.map((p) => ({
    module: p.module,
    actions: { ...p.actions },
  }))
}

export function permissionsEqual(a: RolePermission[], b: RolePermission[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function hasAtLeastOneView(permissions: RolePermission[]): boolean {
  return permissions.some((p) => p.actions.view)
}
