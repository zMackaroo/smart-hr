import { z } from 'zod'
import type { UserRole } from './auth.types'

export type PlatformUserStatus = 'active' | 'inactive' | 'invited'

export const PlatformUserSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['super_admin', 'hr_admin', 'employee']),
  customRoleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'invited']),
  avatarUrl: z.string().optional(),
  employee: z
    .object({
      id: z.string(),
      employeeId: z.string(),
      name: z.string(),
    })
    .optional(),
  lastLoginAt: z.string().nullable(),
  invitedAt: z.string().optional(),
  createdAt: z.string(),
})

export const UserFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  roleId: z.string().min(1, 'Role is required'),
  employeeId: z.string().optional(),
  sendInvite: z.boolean().optional(),
})

export const UserListResponseSchema = z.object({
  data: z.array(PlatformUserSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export type PlatformUser = z.infer<typeof PlatformUserSchema>
export type UserFormInput = z.infer<typeof UserFormSchema>
export type UserListResponse = z.infer<typeof UserListResponseSchema>

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  employee: 'Employee',
}

export type { UserRole }
