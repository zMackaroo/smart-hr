# Spec 19 — Permission-Driven UI & Navigation

## Goal

Complete the Spec 14 integration loop: saved role permissions drive **sidebar
navigation**, **route access**, and **in-page action buttons** — not just the
`usePermission().canModule()` hook in isolation.

After this spec, restricting `hr_admin` payroll `edit` permission hides Edit/Delete
salary buttons and removes Payroll admin nav items the role cannot `view`.

**Implementation note:** Implement in order: (1) nav permission map config, (2)
sidebar + route guard updates, (3) action button guards module-by-module. Do not
change the permission matrix UI (Spec 14).

**Architecture decision:** v1 keeps three fixed roles and `RoleGuard` as a coarse
fallback. Fine-grained checks use `canModule()`. `super_admin` bypasses all checks.
Navigation filters items where `view` permission is false for the user's role.

Completes acceptance criteria implied by Spec 14 § Integration with `usePermission`.

---

## Scope

### In scope
- Permission map: nav item → `{ module, action }`
- Dynamic sidebar filtering via `canModule(module, 'view')`
- Action button wrappers / hooks on high-traffic modules
- Invalidate permission-dependent UI on roles save (TanStack Query already invalidates)

### Out of scope
- Per-user permission overrides (Spec 15 assigns roles only)
- Custom roles (Spec 23)
- Backend enforcement (frontend-only v1)

---

## File Structure

```
src/
├── config/
│   └── permission-nav.config.ts    ← NEW: maps nav hrefs → PermissionModule
├── components/
│   └── shared/
│       ├── PermissionGate.tsx        ← NEW: renders children if canModule
│       └── PermissionButton.tsx      ← NEW: disabled/hidden button variant
└── hooks/
    └── usePermission.ts              ← extend with canViewModule(module)
```

Update existing pages (incremental — priority order below).

---

## Permission Nav Map (`permission-nav.config.ts`)

```ts
export const NAV_PERMISSION_MAP: Record<string, { module: PermissionModule; action?: PermissionAction }> = {
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
  '/reports': { module: 'reports', action: 'view' },
  '/settings/company': { module: 'settings', action: 'view' },
  '/settings/roles': { module: 'settings', action: 'view' },
  '/settings/users': { module: 'settings', action: 'view' },
}
```

Add `bank_accounts` to `PermissionModule` enum in `permission.types.ts` and seed
defaults in `permissions.api.ts` (employee: view only; hr_admin: view + edit).

---

## Shared Components

### `PermissionGate`
```tsx
<PermissionGate module="payroll" action="edit">
  <Button onClick={openEditModal}>Edit</Button>
</PermissionGate>
```
- Renders `null` (or optional `fallback`) when `canModule` is false.
- `super_admin` always renders children.

### `PermissionButton`
- Same as Button but `disabled` + tooltip "You don't have permission" when denied.
- Use when layout should preserve spacing.

---

## Module Action Mapping (priority pages)

| Module        | Pages / actions to gate                                              |
| ------------- | -------------------------------------------------------------------- |
| employees     | Add/Edit/Delete employee buttons                                     |
| departments   | Add/Edit/Delete dept & designation                                   |
| attendance    | Admin edit attendance, export                                        |
| leaves        | Approve/Reject (approve action), Leave Types CRUD (edit)             |
| payroll       | Add/Edit/Delete salary, Generate payslips, PF settings               |
| expenses      | Approve/Reject/Reimburse (approve), Submit (create)                  |
| bank_accounts | Add/Edit/Delete accounts (edit), employee add (create)               |
| recruitment   | Job/Candidate CRUD, referral accept/reject (approve)                 |
| tickets       | Assign, status change (edit), admin filters                          |
| reports       | Generate/Export buttons                                              |
| settings      | Already super_admin route-guarded; no change                         |

---

## Sidebar Integration

Update `getNavSectionsForRole()` in `navigation.config.ts`:

```ts
export function getNavSectionsForRole(role: UserRole, canView: (module: PermissionModule) => boolean)
```

- Filter each item: if `NAV_PERMISSION_MAP[href]` exists, require `canView(module)`.
- Items without map entry fall back to existing `roles` array check.
- `Sidebar.viewmodel.ts` passes `canModule(module, 'view')` from `usePermission`.

---

## Route Guard Enhancement (optional v1)

Add `PermissionGuard` wrapper:

```tsx
<Route element={<PermissionGuard module="reports" action="view" />}>
  <Route path="/reports" element={<ReportsPage />} />
</Route>
```

Redirect to `/dashboard` with toast if permission denied. Keep existing `RoleGuard`
as outer wrapper for now.

---

## ViewModel / Hook Updates

### `usePermission` extensions
```ts
canViewModule(module: PermissionModule): boolean
canEditModule(module: PermissionModule): boolean   // create OR edit
canApproveModule(module: PermissionModule): boolean
```

---

## Acceptance Criteria

1. Disabling `reports.view` for `hr_admin` in Roles & Permissions hides Reports nav item.
2. Disabling `payroll.edit` hides Add/Edit/Delete salary buttons but leaves payslip view.
3. Disabling `expenses.create` hides employee Submit Expense button.
4. Disabling `leaves.approve` hides admin Approve/Reject leave actions.
5. Changes take effect after save without full page reload (query invalidation).
6. `super_admin` always sees full nav and all actions regardless of matrix.
7. `PermissionGate` hides children; denied routes redirect with notification.
8. `npm run build` passes with zero TypeScript errors after implementation.
