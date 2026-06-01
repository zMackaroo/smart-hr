import type { UserRole } from '../types/auth.types'
import {
  SYSTEM_ROLE_IDS,
  resolveUserRoleId,
  type Role,
} from '../types/permission.types'
import { getRoleByIdSync, getRolesSnapshot } from '../api/permissions.api'

export function assignmentFromRoleId(roleId: string): {
  role: UserRole
  customRoleId?: string
} {
  const systemEntry = Object.entries(SYSTEM_ROLE_IDS).find(([, id]) => id === roleId)
  if (systemEntry) {
    return { role: systemEntry[0] as UserRole }
  }

  const matched = getRoleByIdSync(roleId)
  if (!matched) {
    throw new Error('Role not found')
  }

  return { role: 'employee', customRoleId: matched.id }
}

export function getRoleDisplayName(
  user: { role: UserRole; customRoleId?: string },
  roles?: Role[],
): string {
  if (user.customRoleId) {
    const custom =
      roles?.find((role) => role.id === user.customRoleId) ??
      getRoleByIdSync(user.customRoleId)
    return custom?.name ?? 'Custom Role'
  }

  const systemRole = (roles ?? getRolesSnapshot()).find(
    (role) => role.isSystem && role.slug === user.role,
  )
  return systemRole?.name ?? user.role
}

export function resolveUserFormRoleId(user: {
  role: UserRole
  customRoleId?: string
}): string {
  return resolveUserRoleId(user)
}
