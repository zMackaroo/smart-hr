# Spec 03 — App Shell (Sidebar, Topbar, Layout)

## Goal

Build the persistent application shell that wraps every authenticated page:
collapsible sidebar with role-aware navigation, sticky topbar with search /
notifications / user menu, and the main content `<Outlet>`. No feature pages
are built in this spec — only the navigation skeleton.

---

## Routes

No new routes. `AppShell` wraps all protected routes via the existing
`ProtectedRoute` + `<Outlet>` pattern in `routes.tsx`.

---

## File Structure

```
src/
├── components/
│   └── layout/
│       ├── AppShell.tsx
│       ├── Sidebar.tsx
│       ├── Sidebar.viewmodel.ts
│       ├── Topbar.tsx
│       ├── Topbar.viewmodel.ts
│       ├── PageHeader.tsx
│       └── NavItem.tsx             ← reusable single nav link
├── store/
│   └── uiStore.ts                  ← sidebarCollapsed state lives here
└── hooks/
    └── usePermission.ts            ← role-based visibility helper
```

---

## Sidebar Spec

### Layout

```
┌──────────────────────────────┐
│  Logo + app name    [toggle] │  h-16, border-b
├──────────────────────────────┤
│  [section label: MAIN]       │
│  ● Dashboard                 │  active item: orange pill bg
│                              │
│  [section label: HR]         │
│  ○ Employees                 │
│  ○ Departments               │
│  ○ Designations              │
│  ○ Attendance                │
│  ○ Leaves                    │
│                              │
│  [section label: PAYROLL]    │
│  ○ Employee Salary           │
│  ○ Payslip                   │
│  ○ Expenses                  │
│  ○ Provident Fund            │
│                              │
│  [section label: RECRUITMENT]│
│  ○ Jobs                      │
│  ○ Candidates                │
│  ○ Referrals                 │
│                              │
│  [section label: SUPPORT]    │
│  ○ Tickets                   │
│                              │
│  [section label: REPORTS]    │
│  ○ All Reports               │
│                              │
│  [section label: SETTINGS]   │
│  ○ Company Settings          │
│  ○ Roles & Permissions       │
│  ○ Users                     │
│                              │ ← scrollable area
├──────────────────────────────┤
│  [avatar] Name    Role badge │  h-16, border-t, user summary
└──────────────────────────────┘
```

### Collapsed state (`w-16`)
- Section labels hidden
- Nav item text hidden
- Show icon only, centred
- Logo replaced with icon-only mark
- Tooltip on hover showing nav item label

### Behaviour
- `uiStore.sidebarCollapsed` drives `w-64` ↔ `w-16` transition (`transition-all duration-200`)
- Active route: match `useLocation().pathname` with nav item `href`
- Active style: `bg-sidebar-active-bg rounded-lg text-sidebar-active`
- Inactive style: `text-sidebar-text hover:text-sidebar-active hover:bg-white/10`

### Role visibility
| Nav item              | super_admin | hr_admin | employee |
| --------------------- | ----------- | -------- | -------- |
| Dashboard             | ✅          | ✅       | ✅       |
| Employees             | ✅          | ✅       | ❌       |
| Departments           | ✅          | ✅       | ❌       |
| Designations          | ✅          | ✅       | ❌       |
| Attendance            | ✅          | ✅       | ✅       |
| Leaves                | ✅          | ✅       | ✅       |
| Employee Salary       | ✅          | ✅       | ❌       |
| Payslip               | ✅          | ✅       | ✅       |
| Expenses              | ✅          | ✅       | ✅       |
| Provident Fund        | ✅          | ✅       | ❌       |
| Jobs                  | ✅          | ✅       | ❌       |
| Candidates            | ✅          | ✅       | ❌       |
| Referrals             | ✅          | ✅       | ✅       |
| Tickets               | ✅          | ✅       | ✅       |
| All Reports           | ✅          | ✅       | ❌       |
| Settings (all)        | ✅          | ❌       | ❌       |

---

## Topbar Spec

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰ toggle]  [Breadcrumb]          [🔍 Search]  [🔔 Bell]  [Avatar▾]│
└──────────────────────────────────────────────────────────────────┘
```

### Elements (left → right)
1. **Hamburger** — toggles `uiStore.sidebarCollapsed`; `h-5 w-5`
2. **Breadcrumb** — auto-generated from current route path (e.g. "Dashboard",
   "HR / Employees", "HR / Employees / John Doe")
3. **Search bar** — `w-64` input, placeholder "Search…", opens global search
   overlay on focus (overlay is a stub in this spec — just the input)
4. **Notification bell** — icon button with unread count badge (orange dot);
   clicking opens `NotificationDropdown` (stub in this spec — empty panel)
5. **User avatar + name** — clicking opens `UserDropdown`:
   - "My Profile" → `/employees/:currentUserId`
   - "Settings" → `/settings` (admin only)
   - divider
   - "Sign Out" → calls `authStore.logout()`

### Topbar ViewModel (`useTopbarViewModel`)
```ts
returns {
  user: AuthUser
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  breadcrumbs: { label: string; href?: string }[]
  unreadCount: number
  onLogout: () => void
}
```

---

## PageHeader Component

Reusable component placed at the top of every page's content area.

```tsx
<PageHeader
  title="Employees"
  breadcrumbs={[{ label: 'HR' }, { label: 'Employees' }]}
  actions={<Button>+ Add Employee</Button>}
/>
```

Props:
```ts
interface PageHeaderProps {
  title: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: ReactNode
}
```

Renders:
- Left: `h2` title (`text-xl font-semibold text-primary`) + optional breadcrumb row above
- Right: `actions` slot
- Bottom border or `mb-6` spacing

---

## NavItem Component

```tsx
<NavItem
  icon={Users}           // Lucide icon component
  label="Employees"
  href="/employees"
  collapsed={sidebarCollapsed}
/>
```

Active detection via `useMatch` or `location.pathname.startsWith(href)`.

---

## usePermission Hook

```ts
// src/hooks/usePermission.ts
function usePermission(): {
  role: UserRole
  isAdmin: boolean         // super_admin or hr_admin
  isSuperAdmin: boolean
  isEmployee: boolean
  can: (action: PermissionAction) => boolean
}
```

Used by `Sidebar` to filter nav items and by `RoleGuard` to gate pages.

---

## uiStore Shape (already defined in Spec 01 — confirm here)

```ts
interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}
```

---

## Acceptance Criteria

1. Sidebar renders with all nav groups and correct icons.
2. Active route is highlighted with orange pill.
3. Sidebar collapses to icon-only on toggle button click; text and labels hidden.
4. Collapse state persists across page navigations within the session.
5. Nav items not visible to the current role are absent from the DOM (not just hidden).
6. Topbar breadcrumb updates correctly on route change.
7. User dropdown shows correct name/avatar and logout works.
8. Logout clears `authStore`, clears `localStorage`, and redirects to `/login`.
9. `AppShell` renders `<Outlet>` — stub pages render inside the shell.
10. Shell is responsive: sidebar auto-collapses at `< 1024px` viewport width.
