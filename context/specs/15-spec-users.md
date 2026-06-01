# Spec 15 — Users (Platform Accounts)

## Goal

Build the Users management page where a Super Admin creates and manages platform
login accounts (auth users). This is distinct from the **Employees** module —
employees are HR records; users are credentials that grant app access. A user
may optionally link to an employee profile.

**Implementation note:** Implement users API first, then wire to auth mock store
so login works for created users. Update sidebar nav href to `/settings/users`.

---

## Routes

| Path              | Page          | Role        |
| ----------------- | ------------- | ----------- |
| `/settings/users` | `UsersPage`   | super_admin |

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── UsersPage.tsx
│       ├── UsersPage.viewmodel.ts
│       └── components/
│           ├── UserTableRow.tsx
│           ├── UserFormModal.tsx
│           ├── UserFilters.tsx
│           ├── UserStatusBadge.tsx
│           └── DeactivateUserModal.tsx
├── api/
│   └── users.api.ts
└── types/
    └── user.types.ts
```

Note: `user.types.ts` is for **platform users** (auth accounts). Do not conflate
with `employee.types.ts`. Import as `PlatformUser` if naming collision arises.

---

## Zod Schemas & Types (`user.types.ts`)

```ts
export type PlatformUserStatus = 'active' | 'inactive' | 'invited'
export type UserRole = 'super_admin' | 'hr_admin' | 'employee'   // re-export from auth.types

export const PlatformUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['super_admin', 'hr_admin', 'employee']),
  status: z.enum(['active', 'inactive', 'invited']),
  avatarUrl: z.string().optional(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
  }).optional(),
  lastLoginAt: z.string().nullable(),
  invitedAt: z.string().optional(),
  createdAt: z.string(),
})

export const UserFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['super_admin', 'hr_admin', 'employee']),
  employeeId: z.string().optional(),
  sendInvite: z.boolean().default(true),
})

export const UserListResponseSchema = z.object({
  data: z.array(PlatformUserSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
```

---

## API Functions (`users.api.ts`)

```ts
getUsers(params?: {
  search?: string
  role?: UserRole
  status?: PlatformUserStatus
  page?: number
  perPage?: number
}): Promise<UserListResponse>
  GET /api/users

getUser(id: string): Promise<PlatformUser>
  GET /api/users/:id

createUser(data: UserFormInput): Promise<PlatformUser>
  POST /api/users

updateUser(id: string, data: Partial<UserFormInput>): Promise<PlatformUser>
  PUT /api/users/:id

deactivateUser(id: string): Promise<PlatformUser>
  PATCH /api/users/:id/deactivate

reactivateUser(id: string): Promise<PlatformUser>
  PATCH /api/users/:id/reactivate

resendInvite(id: string): Promise<void>
  POST /api/users/:id/resend-invite

resetUserPassword(id: string): Promise<void>
  POST /api/users/:id/reset-password   // mock: always succeeds
```

**Mock data notes:**
- Seed users aligned with auth mock credentials:
  - `admin@smarthr.com` → hr_admin, active
  - `super@smarthr.com` → super_admin, active
  - `employee@smarthr.com` → employee, linked to `usr-employee-1`
- Creating a user with `sendInvite: true` sets status `invited` until first login (mock: stays invited).
- Default password for new users in mock: `password123` (document in session notes only).
- Email must be unique across users store and auth mock.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Standard data table layout with filters above.
- Status badges: Active (success), Inactive (error), Invited (warning).
- Role displayed as readable label (Super Admin / HR Admin / Employee).

---

## Page UI

### Page Header
- Title: "Users"
- Breadcrumbs: `[Settings] → [Users]`
- Right: `[+ Add User]` button

### Filter Bar (`UserFilters`)
- Search input (name, email)
- Role dropdown (All / Super Admin / HR Admin / Employee)
- Status dropdown (All / Active / Inactive / Invited)

### Table Columns
| User | Email | Role | Linked Employee | Status | Last Login | Actions |

- User: avatar + name
- Linked Employee: employee name or "—"
- Last Login: relative time or "Never"
- Actions: Edit, Deactivate/Reactivate, Resend Invite (invited only), Reset Password

Row actions menu acceptable if table is crowded.

### Add / Edit User Modal (`UserFormModal`)
Fields:
- Full Name (required)
- Email (required; disabled on edit)
- Role (select)
- Link to Employee (optional select from employee picker)
- Send invite email (checkbox, create only; default checked)

### Deactivate User Modal (`DeactivateUserModal`)
- Confirm dialog with user name
- Block deactivation if user is the only active `super_admin`
- Block self-deactivation (current logged-in user)

---

## ViewModel Hook

### `useUsersPageViewModel`
```ts
returns {
  users: PlatformUser[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  roleFilter: UserRole | ''
  setRoleFilter: (r: UserRole | '') => void
  statusFilter: PlatformUserStatus | ''
  setStatusFilter: (s: PlatformUserStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  selectedUser: PlatformUser | null
  isFormModalOpen: boolean
  isDeactivateModalOpen: boolean
  openAddModal: () => void
  openEditModal: (user: PlatformUser) => void
  openDeactivateModal: (user: PlatformUser) => void
  closeModal: () => void
  onSubmit: (data: UserFormInput) => void
  onConfirmDeactivate: () => void
  onReactivate: (id: string) => void
  onResendInvite: (id: string) => void
  onResetPassword: (id: string) => void
  isSubmitting: boolean
  employees: Array<{ id: string; name: string; employeeId: string }>
}
```

---

## Delete / Deactivate Guards

| Condition                              | Behaviour                          |
| -------------------------------------- | ---------------------------------- |
| Only active super_admin                | Block deactivate                   |
| Current logged-in user                 | Block deactivate                   |
| User linked to employee                | Allow deactivate; link preserved   |

Hard delete is out of scope for v1 — use deactivate only.

---

## Route Guards & Nav

- Route `/settings/users` → `RoleGuard roles={['super_admin']}`.
- Update nav: Users href → `/settings/users`.

---

## Acceptance Criteria

1. Super Admin sees paginated user list with search and filters.
2. Super Admin can create a user with role and optional employee link.
3. Super Admin can edit user name, role, and employee link (not email).
4. Super Admin can deactivate/reactivate users with guard rules enforced.
5. Resend invite and reset password actions show success toast (mock).
6. Invited users show Invited badge; active users show Last Login.
7. Cannot deactivate the only active super_admin or self.
8. New users appear in list immediately after creation.
9. Non–super-admin users cannot access `/settings/users`.
10. `npm run build` passes with zero TypeScript errors after implementation.
