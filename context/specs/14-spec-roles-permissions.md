# Spec 14 — Roles & Permissions

## Goal

Build the Roles & Permissions page where a Super Admin views the system role
catalogue and configures module-level permissions for `hr_admin` and `employee`
roles. `super_admin` always has full access and is not editable. Permission
changes update the mock permissions store and drive `usePermission()` checks
app-wide.

**Implementation note:** Implement API + permission hook integration first, then
the settings UI. Update sidebar nav href to `/settings/roles`.

**Architecture decision:** v1 uses three fixed system roles (no custom role
creation). Permissions are stored as a module × action matrix per role, not
per-user overrides. User-level role assignment happens in Spec 15 (Users).

---

## Routes

| Path               | Page                    | Role        |
| ------------------ | ----------------------- | ----------- |
| `/settings/roles`  | `RolesPermissionsPage`  | super_admin |

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── RolesPermissionsPage.tsx
│       ├── RolesPermissionsPage.viewmodel.ts
│       └── components/
│           ├── RoleListPanel.tsx
│           ├── PermissionMatrix.tsx
│           └── PermissionToggleCell.tsx
├── api/
│   └── permissions.api.ts
└── types/
    └── permission.types.ts
```

Update `src/hooks/usePermission.ts` to read from permissions API store instead
of hardcoded `ACTION_ROLES` (keep fallback defaults for bootstrapping).

---

## Zod Schemas & Types (`permission.types.ts`)

```ts
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

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve'

export const RolePermissionSchema = z.object({
  module: z.enum([
    'dashboard', 'employees', 'departments', 'attendance', 'leaves',
    'payroll', 'recruitment', 'tickets', 'reports', 'settings', 'expenses',
  ]),
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
  name: z.string(),                    // "Super Admin", "HR Admin", "Employee"
  slug: z.enum(['super_admin', 'hr_admin', 'employee']),
  description: z.string(),
  isSystem: z.boolean(),                 // true for all three v1 roles
  userCount: z.number(),
  permissions: z.array(RolePermissionSchema),
  updatedAt: z.string(),
})

export const UpdateRolePermissionsSchema = z.object({
  permissions: z.array(RolePermissionSchema),
})
```

**Permission matrix rules (v1):**
- `approve` applies to: leaves, expenses, tickets, recruitment (referrals).
- `delete` hidden/disabled for modules without delete semantics (dashboard).
- `super_admin` slug: matrix read-only, all actions `true`.
- At least one `view` permission must remain enabled per editable role.

---

## API Functions (`permissions.api.ts`)

```ts
getRoles(): Promise<Role[]>
  GET /api/permissions/roles

getRole(slug: RoleSlug): Promise<Role>
  GET /api/permissions/roles/:slug

updateRolePermissions(slug: RoleSlug, data: UpdateRolePermissionsInput): Promise<Role>
  PUT /api/permissions/roles/:slug/permissions

getEffectivePermissions(role: UserRole): Promise<Record<PermissionModule, PermissionAction[]>>
  GET /api/permissions/effective/:role   // used by usePermission hook
```

**Mock data notes:**
- Seed three roles with sensible defaults matching current app behaviour.
- `hr_admin`: full HR/payroll/recruitment/reports; no settings.
- `employee`: view dashboard, own attendance/leaves/payslip/expenses/tickets/referrals.
- `userCount` computed from users store (Spec 15) or employees with matching role.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Two-column layout on desktop: role list (left, `w-64`) + permission matrix (right).
- On mobile: role select dropdown above matrix.
- Matrix uses sticky module column + horizontal scroll for action columns.
- Toggle cells use checkbox or switch; disabled/greyed for non-applicable actions.

---

## Page UI

### Page Header
- Title: "Roles & Permissions"
- Breadcrumbs: `[Settings] → [Roles & Permissions]`

### Left Panel — Role List (`RoleListPanel`)
- List of three system roles as selectable cards/rows
- Each shows: role name, description snippet, user count badge
- Selected role highlighted with accent border
- No "Add Role" in v1 (system roles only)

### Right Panel — Permission Matrix (`PermissionMatrix`)
Header row: Module | View | Create | Edit | Delete | Approve

Each module row:
- Module label (human-readable)
- Toggle per action column
- "—" or disabled toggle where action N/A (e.g. Dashboard → no create/delete)
- Info tooltip on `approve` column explaining scope

Footer (editable roles only):
- `[Reset to Defaults]` outline button
- `[Save Permissions]` primary button

### Read-only State (super_admin role selected)
- Banner: "Super Admin has full access. Permissions cannot be modified."
- Matrix toggles all checked and disabled

### Unsaved Changes
- Save button enabled only when matrix differs from last saved state
- Confirm dialog on role switch if unsaved changes exist

---

## ViewModel Hook

### `useRolesPermissionsPageViewModel`
```ts
returns {
  roles: Role[]
  selectedRole: Role | undefined
  selectedSlug: RoleSlug | ''
  setSelectedSlug: (slug: RoleSlug) => void
  isLoading: boolean
  isSubmitting: boolean
  draftPermissions: RolePermission[]
  onToggle: (module: PermissionModule, action: PermissionAction, value: boolean) => void
  onResetDefaults: () => void
  onSave: () => void
  isDirty: boolean
  isReadOnly: boolean
}
```

---

## Integration with `usePermission`

Extend `usePermission()`:

```ts
canModule(module: PermissionModule, action: PermissionAction): boolean
```

Map existing shorthand actions (`manage_employees`, etc.) to module checks for
backwards compatibility during migration.

Route guards (`RoleGuard`) remain role-based in v1; fine-grained guards use
`canModule()` inside pages for action buttons (edit/delete/approve).

---

## Route Guards & Nav

- Route `/settings/roles` → `RoleGuard roles={['super_admin']}`.
- Update nav: Roles & Permissions href → `/settings/roles`.

---

## Acceptance Criteria

1. Super Admin sees all three system roles with correct user counts.
2. Selecting `hr_admin` or `employee` shows editable permission matrix.
3. Selecting `super_admin` shows read-only full-access matrix.
4. Saving permission changes persists in mock store and survives refresh.
5. `usePermission().canModule()` reflects saved permissions after save.
6. Reset to Defaults restores seed permissions for selected role.
7. Attempting to disable all `view` permissions shows validation error.
8. Unsaved-changes confirm appears when switching roles with dirty matrix.
9. Non–super-admin users cannot access `/settings/roles`.
10. `npm run build` passes with zero TypeScript errors after implementation.
