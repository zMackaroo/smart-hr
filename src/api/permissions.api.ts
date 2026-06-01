import type { UserRole } from '../types/auth.types'
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  RoleSchema,
  UpdateRolePermissionsSchema,
  CreateRoleSchema,
  isActionApplicable,
  isSystemRoleSlug,
  clonePermissions,
  type CreateRoleInput,
  type EffectivePermissions,
  type PermissionAction,
  type PermissionModule,
  type Role,
  type RolePermission,
  type RoleSlug,
  type UpdateRolePermissionsInput,
} from '../types/permission.types'
import { getRoleAssignmentCounts } from './users.api'

const MOCK_DELAY_MS = 350
const STORAGE_KEY = 'smarthr-permissions-v2'

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildPermissions(
  config: Partial<
    Record<PermissionModule, Partial<Record<PermissionAction, boolean>>>
  >,
): RolePermission[] {
  return PERMISSION_MODULES.map((module) => {
    const actions = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      approve: false,
      ...config[module],
    }

    for (const action of PERMISSION_ACTIONS) {
      if (!isActionApplicable(module, action)) {
        actions[action] = false
      }
    }

    return { module, actions }
  })
}

function buildFullAccessPermissions(): RolePermission[] {
  return PERMISSION_MODULES.map((module) => ({
    module,
    actions: {
      view: true,
      create: isActionApplicable(module, 'create'),
      edit: isActionApplicable(module, 'edit'),
      delete: isActionApplicable(module, 'delete'),
      approve: isActionApplicable(module, 'approve'),
    },
  }))
}

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleSlug, RolePermission[]> = {
  super_admin: buildFullAccessPermissions(),
  hr_admin: buildPermissions({
    dashboard: { view: true },
    employees: { view: true, create: true, edit: true, delete: true },
    departments: { view: true, create: true, edit: true, delete: true },
    attendance: { view: true, edit: true },
    leaves: { view: true, approve: true },
    payroll: { view: true, create: true, edit: true },
    recruitment: { view: true, create: true, edit: true, delete: true, approve: true },
    tickets: { view: true, edit: true },
    reports: { view: true },
    settings: {},
    expenses: { view: true, approve: true },
    bank_accounts: { view: true, create: true, edit: true, delete: true },
    projects: { view: true, create: true, edit: true, delete: true },
  }),
  employee: buildPermissions({
    dashboard: { view: true },
    employees: { view: true },
    attendance: { view: true },
    leaves: { view: true, create: true },
    payroll: { view: true },
    recruitment: { view: true, create: true },
    tickets: { view: true, create: true },
    expenses: { view: true, create: true },
    bank_accounts: { view: true, create: true },
    projects: { view: true, create: true },
  }),
}

function createDefaultRoles(): Role[] {
  const userCounts = getRoleAssignmentCounts()

  return RoleSchema.array().parse([
    {
      id: 'role-super-admin',
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full platform access including company and security settings.',
      isSystem: true,
      userCount: userCounts['role-super-admin'] ?? 0,
      permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-hr-admin',
      name: 'HR Admin',
      slug: 'hr_admin',
      description: 'Manages employees, payroll, recruitment, and day-to-day HR operations.',
      isSystem: true,
      userCount: userCounts['role-hr-admin'] ?? 0,
      permissions: DEFAULT_ROLE_PERMISSIONS.hr_admin,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'role-employee',
      name: 'Employee',
      slug: 'employee',
      description: 'Self-service access to attendance, leave, payslips, tickets, and expenses.',
      isSystem: true,
      userCount: userCounts['role-employee'] ?? 0,
      permissions: DEFAULT_ROLE_PERMISSIONS.employee,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ])
}

function attachUserCounts(roles: Role[]): Role[] {
  const userCounts = getRoleAssignmentCounts()
  return roles.map((role) =>
    RoleSchema.parse({
      ...role,
      userCount: userCounts[role.id] ?? 0,
    }),
  )
}

function loadRolesFromStorage(): Role[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem('smarthr-permissions-v1')
      if (!legacy) return null
      return RoleSchema.array().parse(JSON.parse(legacy))
    }
    return RoleSchema.array().parse(JSON.parse(raw))
  } catch {
    return null
  }
}

function saveRolesToStorage(roles: Role[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
}

let roleStore: Role[] = attachUserCounts(loadRolesFromStorage() ?? createDefaultRoles())

function refreshStoreUserCounts() {
  roleStore = attachUserCounts(roleStore)
}

function permissionsToEffective(
  permissions: RolePermission[],
): EffectivePermissions {
  const effective = {} as EffectivePermissions

  for (const module of PERMISSION_MODULES) {
    effective[module] = []
  }

  for (const entry of permissions) {
    effective[entry.module] = PERMISSION_ACTIONS.filter(
      (action) => entry.actions[action] && isActionApplicable(entry.module, action),
    )
  }

  return effective
}

function findRoleIndex(roleKey: string): number {
  return roleStore.findIndex((item) => item.id === roleKey || item.slug === roleKey)
}

export function getRoleByIdSync(id: string): Role | undefined {
  return roleStore.find((item) => item.id === id)
}

export function getRolesSnapshot(): Role[] {
  return roleStore
}

export function getDefaultEffectivePermissions(
  role: UserRole,
  customRoleId?: string,
): EffectivePermissions {
  if (role === 'super_admin' && !customRoleId) {
    return permissionsToEffective(DEFAULT_ROLE_PERMISSIONS.super_admin)
  }

  if (customRoleId) {
    const custom = roleStore.find((item) => item.id === customRoleId)
    if (custom) {
      return permissionsToEffective(custom.permissions)
    }
  }

  const slug = role as RoleSlug
  return permissionsToEffective(DEFAULT_ROLE_PERMISSIONS[slug])
}

export const PERMISSIONS_QUERY_KEY = ['permissions'] as const

export async function getRoles(): Promise<Role[]> {
  await delay()
  refreshStoreUserCounts()
  return RoleSchema.array().parse(roleStore)
}

export async function getRole(roleKey: string): Promise<Role> {
  await delay()
  refreshStoreUserCounts()
  const role = roleStore.find((item) => item.id === roleKey || item.slug === roleKey)
  if (!role) {
    throw new Error('Role not found')
  }
  return RoleSchema.parse(role)
}

export async function createRole(data: CreateRoleInput): Promise<Role> {
  await delay()

  const parsed = CreateRoleSchema.parse(data)
  const source = roleStore.find((item) => item.id === parsed.cloneFromRoleId)
  if (!source) {
    throw new Error('Source role not found')
  }

  const slug = `custom-${crypto.randomUUID().slice(0, 8)}`
  const created = RoleSchema.parse({
    id: `role-${Date.now()}`,
    name: parsed.name.trim(),
    slug,
    description: parsed.description?.trim() || 'Custom role',
    isSystem: false,
    userCount: 0,
    permissions: clonePermissions(source.permissions),
    updatedAt: new Date().toISOString(),
  })

  roleStore.push(created)
  saveRolesToStorage(roleStore)
  return created
}

export async function duplicateRole(roleId: string): Promise<Role> {
  const source = roleStore.find((item) => item.id === roleId)
  if (!source) {
    throw new Error('Role not found')
  }

  return createRole({
    name: `${source.name} (Copy)`,
    description: source.description,
    cloneFromRoleId: source.id,
  })
}

export async function deleteRole(roleId: string): Promise<void> {
  await delay()

  const index = roleStore.findIndex((item) => item.id === roleId)
  if (index === -1) {
    throw new Error('Role not found')
  }

  const role = roleStore[index]
  if (role.isSystem) {
    throw new Error('System roles cannot be deleted')
  }

  refreshStoreUserCounts()
  if (role.userCount > 0) {
    throw new Error(`Cannot delete role with ${role.userCount} assigned user(s)`)
  }

  roleStore.splice(index, 1)
  saveRolesToStorage(roleStore)
}

export async function updateRolePermissions(
  roleKey: string,
  data: UpdateRolePermissionsInput,
): Promise<Role> {
  await delay()

  const index = findRoleIndex(roleKey)
  if (index === -1) {
    throw new Error('Role not found')
  }

  if (roleStore[index].slug === 'super_admin') {
    throw new Error('Super Admin permissions cannot be modified')
  }

  const parsed = UpdateRolePermissionsSchema.parse(data)
  const hasView = parsed.permissions.some((permission) => permission.actions.view)
  if (!hasView) {
    throw new Error('At least one module must have View permission enabled')
  }

  const updated = RoleSchema.parse({
    ...roleStore[index],
    permissions: parsed.permissions,
    updatedAt: new Date().toISOString(),
  })

  roleStore[index] = updated
  saveRolesToStorage(roleStore)

  return updated
}

export async function resetRolePermissions(roleKey: string): Promise<Role> {
  const index = findRoleIndex(roleKey)
  if (index === -1) {
    throw new Error('Role not found')
  }

  const role = roleStore[index]
  if (role.slug === 'super_admin') {
    throw new Error('Super Admin permissions cannot be reset')
  }

  if (role.isSystem && isSystemRoleSlug(role.slug)) {
    return updateRolePermissions(roleKey, {
      permissions: DEFAULT_ROLE_PERMISSIONS[role.slug].map((permission) => ({
        module: permission.module,
        actions: { ...permission.actions },
      })),
    })
  }

  return updateRolePermissions(roleKey, {
    permissions: DEFAULT_ROLE_PERMISSIONS.employee.map((permission) => ({
      module: permission.module,
      actions: { ...permission.actions },
    })),
  })
}

export async function getEffectivePermissions(
  role: UserRole,
  customRoleId?: string,
): Promise<EffectivePermissions> {
  await delay(150)

  if (role === 'super_admin' && !customRoleId) {
    return permissionsToEffective(DEFAULT_ROLE_PERMISSIONS.super_admin)
  }

  if (customRoleId) {
    const custom = roleStore.find((item) => item.id === customRoleId)
    if (custom) {
      return permissionsToEffective(custom.permissions)
    }
  }

  const slug = role as RoleSlug
  const stored = roleStore.find((item) => item.slug === slug && item.isSystem)
  const permissions = stored?.permissions ?? DEFAULT_ROLE_PERMISSIONS[slug]
  return permissionsToEffective(permissions)
}
