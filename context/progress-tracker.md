# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Spec 12 complete — Reports hub with 6 report types, preview modal, and CSV export.

## Current Goal

All v1 feature specs (01–12) are implemented. Remaining work is polish, testing, and optional deferred items (Expenses module, PDF export).

## Completed

## Completed

- [x] UI kit studied (SmartHR Figma kit)
- [x] `project-overview.md` written
- [x] `architecture.md` written
- [x] `ui-context.md` written (colour tokens, layout shell, component patterns)
- [x] `code-standards.md` written
- [x] `ai-workflow-rules.md` written
- [x] `specs/01-spec-project-setup.md` written
- [x] **Spec 01 implemented** — Vite + React + TS scaffold, Tailwind tokens, folder structure, stores, axios, router, UI primitives, page stubs
- [x] **Spec 02 implemented** — Login, Register, Forgot/Reset Password, Email Verify, 2FA with mock API
- [x] **Spec 03 implemented** — App shell: collapsible sidebar, topbar, breadcrumbs, role-aware nav, user/notification dropdowns
- [x] **Spec 04 implemented** — Admin + Employee dashboards with KPI cards, Recharts, attendance table, mock API
- [x] **Spec 05 implemented** — Employee grid/list, filters, pagination, add/edit/delete modals, detail page with 5 tabs
- [x] **Spec 06 implemented** — Departments & Designations tables, CRUD modals, delete guards, shared org-data store, Employee dropdowns wired via TanStack Query
- [x] **Spec 07 implemented** — Admin attendance table with filters/pagination/export/edit; employee clock-in/out, calendar, and monthly summary
- [x] **Spec 08 implemented** — Leave types CRUD, admin approve/reject, employee balance cards, apply leave, cancel pending
- [x] **Spec 09 implemented** — Employee salary CRUD, payslip generate/export/download, PF management with settings
- [x] **Spec 10 implemented** — Job postings CRUD, candidate pipeline, employee referrals with accept/reject flow
- [x] **Spec 11 implemented** — Support tickets with admin filters, employee create/view, comment thread, assign/status actions
- [x] **Spec 12 implemented** — Reports hub with preview modal, dynamic filters, paginated tables, CSV export

## In Progress

- Nothing in progress

## Next Up

1. Optional: implement `/payroll/expenses` (Expense Report currently "Coming Soon")
2. Optional: PDF export for reports
3. End-to-end QA pass across all modules

## Open Questions

- [x] **API backend**: Frontend-only — mock APIs in `src/api/`.
- [x] **Auth provider**: Simulated JWT via mock API + Zustand persist.
- [x] **Payroll computation**: Resolved in Spec 09 — mock API computes net pay; UI displays only.
- [x] **Export format for reports**: Resolved in Spec 12 — CSV only in v1; PDF deferred.
- [ ] **Company multi-tenancy**: Does `super_admin` manage multiple companies in one instance, or is it a single-company deployment?

## Architecture Decisions

- **MVVM pattern adopted** — Separates rendering from logic. Every page has a paired `.viewmodel.ts` hook. Views are JSX-only.
- **TanStack Query for server state** — Avoids duplicating remote data in Zustand. Zustand is reserved for auth, UI, and ephemeral state.
- **Zod at all API boundaries** — All API responses parsed with Zod before use. Prevents runtime type errors from propagating into the UI.
- **Tailwind + CSS custom properties** — Design tokens live in CSS variables, mapped into Tailwind theme config. Enables consistent theming without arbitrary value overuse.
- **Frontend-only v1** — No backend development; API calls use mock data until a real backend is available.

## Session Notes

- Spec 02 mock credentials:
  - `admin@smarthr.com` / `password123` → hr_admin (Admin Dashboard + Employees)
  - `super@smarthr.com` / `password123` → super_admin
  - `employee@smarthr.com` / `password123` → employee (Employee Dashboard; profile at `/employees/usr-employee-1`)
  - `2fa@smarthr.com` / `password123` → requires 2FA (code: `123456`)
- Employees list gated to `hr_admin` / `super_admin` via `RoleGuard`.
- Departments and Designations pages also gated to `hr_admin` / `super_admin`.
- Employees can only view their own profile page; others redirect to dashboard.
