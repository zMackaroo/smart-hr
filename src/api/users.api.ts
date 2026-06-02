import type { AuthResponse } from '../types/auth.types'
import type { UserRole } from '../types/auth.types'
import {
  PlatformUserSchema,
  UserFormSchema,
  UserListResponseSchema,
  type PlatformUser,
  type PlatformUserStatus,
  type UserFormInput,
  type UserListResponse,
} from '../types/user.types'
import { SYSTEM_ROLE_IDS, matchesRoleFilter } from '../types/permission.types'
import { getEmployeeByIdSync, getEmployeeLinkOptions } from './employees.api'
import {
  filterByCompany,
  getActiveCompanyIdSync,
} from '../utils/company-context.utils'

const MOCK_DELAY_MS = 350
const STORAGE_KEY = 'smarthr-users-v1'
const DEFAULT_PASSWORD = 'password123'

type InternalUser = PlatformUser & {
  password: string
  requiresTwoFactor?: boolean
}

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assignmentFromRoleId(roleId: string): {
  role: UserRole
  customRoleId?: string
} {
  const systemEntry = Object.entries(SYSTEM_ROLE_IDS).find(([, id]) => id === roleId)
  if (systemEntry) {
    return { role: systemEntry[0] as UserRole }
  }
  return { role: 'employee', customRoleId: roleId }
}

function toPlatformUser(user: InternalUser): PlatformUser {
  return PlatformUserSchema.parse({
    id: user.id,
    companyId: user.companyId,
    name: user.name,
    email: user.email,
    role: user.role,
    customRoleId: user.customRoleId,
    status: user.status,
    avatarUrl: user.avatarUrl,
    employee: user.employee,
    lastLoginAt: user.lastLoginAt,
    invitedAt: user.invitedAt,
    createdAt: user.createdAt,
  })
}

function resolveEmployeeLink(employeeId?: string) {
  if (!employeeId) return undefined
  const employee = getEmployeeByIdSync(employeeId)
  if (!employee) return undefined
  return {
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.fullName,
  }
}

function createSeedUsers(): InternalUser[] {
  return [
    {
      id: 'usr-super-1',
      companyId: 'co-1',
      name: 'Super Admin',
      email: 'super@smarthr.com',
      role: 'super_admin',
      status: 'active',
      employee: {
        id: 'usr-super-1',
        employeeId: 'EMP-SUP',
        name: 'Super Admin',
      },
      lastLoginAt: '2026-06-01T08:30:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
    },
    {
      id: 'usr-admin-1',
      companyId: 'co-1',
      name: 'HR Admin',
      email: 'admin@smarthr.com',
      role: 'hr_admin',
      status: 'active',
      employee: {
        id: 'usr-admin-1',
        employeeId: 'EMP-HRA',
        name: 'HR Admin',
      },
      lastLoginAt: '2026-05-31T14:20:00.000Z',
      createdAt: '2025-01-02T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
    },
    {
      id: 'usr-employee-1',
      companyId: 'co-1',
      name: 'Jane Employee',
      email: 'employee@smarthr.com',
      role: 'employee',
      status: 'active',
      employee: {
        id: 'usr-employee-1',
        employeeId: 'EMP-001',
        name: 'Jane Employee',
      },
      lastLoginAt: '2026-05-30T09:15:00.000Z',
      createdAt: '2025-01-03T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
    },
    {
      id: 'usr-2fa-1',
      companyId: 'co-1',
      name: 'Two Factor User',
      email: '2fa@smarthr.com',
      role: 'hr_admin',
      status: 'active',
      lastLoginAt: '2026-05-28T11:00:00.000Z',
      createdAt: '2025-02-01T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
      requiresTwoFactor: true,
    },
    {
      id: 'usr-co2-admin',
      companyId: 'co-2',
      name: 'Alex Admin',
      email: 'admin@acme.com',
      role: 'hr_admin',
      status: 'active',
      lastLoginAt: '2026-05-29T10:00:00.000Z',
      createdAt: '2025-06-01T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
    },
    {
      id: 'usr-co2-employee-1',
      companyId: 'co-2',
      name: 'Bob Builder',
      email: 'employee@acme.com',
      role: 'employee',
      status: 'active',
      employee: {
        id: 'usr-co2-employee-1',
        employeeId: 'ACM-002',
        name: 'Bob Builder',
      },
      lastLoginAt: '2026-05-28T08:00:00.000Z',
      createdAt: '2025-07-01T00:00:00.000Z',
      password: DEFAULT_PASSWORD,
    },
  ]
}

function loadUsersFromStorage(): InternalUser[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as InternalUser[]
    return parsed.map((user) => ({
      ...user,
      companyId: user.companyId ?? 'co-1',
      password: user.password ?? DEFAULT_PASSWORD,
    }))
  } catch {
    return null
  }
}

function saveUsersToStorage(users: InternalUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

let userStore: InternalUser[] = loadUsersFromStorage() ?? createSeedUsers()

function assertEmailUnique(email: string, excludeId?: string) {
  const exists = userStore.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId,
  )
  if (exists) {
    throw new Error('A user with this email already exists')
  }
}

function assertCanDeactivate(targetId: string, currentUserId?: string) {
  if (currentUserId && targetId === currentUserId) {
    throw new Error('You cannot deactivate your own account')
  }

  const target = userStore.find((user) => user.id === targetId)
  if (!target) {
    throw new Error('User not found')
  }

  if (target.role === 'super_admin' && !target.customRoleId && target.status === 'active') {
    const activeSuperAdmins = userStore.filter(
      (user) => user.role === 'super_admin' && !user.customRoleId && user.status === 'active',
    )
    if (activeSuperAdmins.length <= 1) {
      throw new Error('Cannot deactivate the only active Super Admin')
    }
  }
}

export const USERS_QUERY_KEY = ['users'] as const

export function getRoleAssignmentCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const user of userStore) {
    const roleId = user.customRoleId ?? SYSTEM_ROLE_IDS[user.role]
    counts[roleId] = (counts[roleId] ?? 0) + 1
  }
  return counts
}

export function findAuthUserByEmail(email: string):
  | {
      password: string
      requiresTwoFactor?: boolean
      status: PlatformUserStatus
      user: AuthResponse['user']
    }
  | undefined {
  const account = userStore.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  )

  if (!account) return undefined

  return {
    password: account.password,
    requiresTwoFactor: account.requiresTwoFactor,
    status: account.status,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      customRoleId: account.customRoleId,
      avatarUrl: account.avatarUrl,
      companyId: account.companyId,
    },
  }
}

export async function recordUserLogin(id: string): Promise<void> {
  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) return

  userStore[index] = {
    ...userStore[index],
    lastLoginAt: new Date().toISOString(),
    status: userStore[index].status === 'invited' ? 'active' : userStore[index].status,
    invitedAt: userStore[index].status === 'invited' ? undefined : userStore[index].invitedAt,
  }
  saveUsersToStorage(userStore)
}

export async function getUsers(params?: {
  search?: string
  roleId?: string
  status?: PlatformUserStatus
  page?: number
  perPage?: number
}): Promise<UserListResponse> {
  await delay()

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 10
  const search = params?.search?.trim().toLowerCase()

  let filtered = filterByCompany(userStore)

  if (search) {
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    )
  }

  if (params?.roleId) {
    filtered = filtered.filter((user) => matchesRoleFilter(user, params.roleId!))
  }

  if (params?.status) {
    filtered = filtered.filter((user) => user.status === params.status)
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name))

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage
  const data = filtered.slice(start, start + perPage).map(toPlatformUser)

  return UserListResponseSchema.parse({
    data,
    total,
    page: safePage,
    perPage,
    totalPages,
  })
}

export async function getUser(id: string): Promise<PlatformUser> {
  await delay()
  const user = userStore.find((item) => item.id === id)
  if (!user) {
    throw new Error('User not found')
  }
  return toPlatformUser(user)
}

export async function createUser(data: UserFormInput): Promise<PlatformUser> {
  await delay()

  const parsed = UserFormSchema.parse(data)
  assertEmailUnique(parsed.email)

  const assignment = assignmentFromRoleId(parsed.roleId)
  const now = new Date().toISOString()
  const status: PlatformUserStatus = parsed.sendInvite !== false ? 'invited' : 'active'

  const created: InternalUser = {
    id: `usr-${Date.now()}`,
    companyId: getActiveCompanyIdSync(),
    name: parsed.name,
    email: parsed.email,
    role: assignment.role,
    customRoleId: assignment.customRoleId,
    status,
    employee: resolveEmployeeLink(parsed.employeeId),
    lastLoginAt: null,
    invitedAt: parsed.sendInvite !== false ? now : undefined,
    createdAt: now,
    password: DEFAULT_PASSWORD,
  }

  userStore.push(created)
  saveUsersToStorage(userStore)

  return toPlatformUser(created)
}

export async function updateUser(
  id: string,
  data: Partial<UserFormInput>,
): Promise<PlatformUser> {
  await delay()

  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  const current = userStore[index]
  const employeeId =
    data.employeeId === '' ? undefined : (data.employeeId ?? current.employee?.id)

  const assignment = data.roleId ? assignmentFromRoleId(data.roleId) : undefined

  const updated: InternalUser = {
    ...current,
    name: data.name ?? current.name,
    role: assignment?.role ?? current.role,
    customRoleId: assignment ? assignment.customRoleId : current.customRoleId,
    employee: resolveEmployeeLink(employeeId),
  }

  if (assignment && !assignment.customRoleId) {
    updated.customRoleId = undefined
  }

  userStore[index] = updated
  saveUsersToStorage(userStore)

  return toPlatformUser(updated)
}

export async function deactivateUser(
  id: string,
  currentUserId?: string,
): Promise<PlatformUser> {
  await delay()

  assertCanDeactivate(id, currentUserId)

  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  userStore[index] = { ...userStore[index], status: 'inactive' }
  saveUsersToStorage(userStore)

  return toPlatformUser(userStore[index])
}

export async function reactivateUser(id: string): Promise<PlatformUser> {
  await delay()

  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  userStore[index] = { ...userStore[index], status: 'active' }
  saveUsersToStorage(userStore)

  return toPlatformUser(userStore[index])
}

export async function resendInvite(id: string): Promise<void> {
  await delay()

  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  if (userStore[index].status !== 'invited') {
    throw new Error('Invite can only be resent to invited users')
  }

  userStore[index] = {
    ...userStore[index],
    invitedAt: new Date().toISOString(),
  }
  saveUsersToStorage(userStore)
}

export async function resetUserPassword(id: string): Promise<void> {
  await delay()

  const index = userStore.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new Error('User not found')
  }

  userStore[index] = { ...userStore[index], password: DEFAULT_PASSWORD }
  saveUsersToStorage(userStore)
}

export async function createUserFromRegistration(params: {
  firstName: string
  lastName: string
  email: string
  password: string
  companyId: string
}): Promise<InternalUser> {
  assertEmailUnique(params.email)

  const created: InternalUser = {
    id: `usr-${Date.now()}`,
    companyId: params.companyId,
    name: `${params.firstName} ${params.lastName}`,
    email: params.email,
    role: 'super_admin',
    status: 'active',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    password: params.password,
  }

  userStore.push(created)
  saveUsersToStorage(userStore)
  return created
}

export { getEmployeeLinkOptions }
