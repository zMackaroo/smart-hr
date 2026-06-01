# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Specs 01–24 implemented. Phase 3 complete for v1 frontend scope.

## Current Goal

Maintenance / next backlog items (22c custom domains, backend integration, etc.).

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
- [x] **Spec 13 implemented** — Company Settings page with profile, regional prefs, HR defaults, notifications
- [x] **Spec 14 implemented** — Roles & Permissions matrix with mock store, localStorage persistence, usePermission integration
- [x] **Spec 15 implemented** — Platform Users CRUD, deactivate/reactivate guards, auth store sync, invite/reset actions
- [x] **Spec 16 implemented** — Expense claims admin/employee views, approve/reject/reimburse workflow, Expense Report enabled
- [x] **Spec 17 implemented** — Bank accounts admin/employee views, CRUD + primary account, payslip/salary/payment report integration
- [x] **Spec 18 implemented** — Org chart with hierarchy tree, admin/employee scoped views, filters, detail panel, mobile list fallback
- [x] **Spec 19 implemented** — Permission-driven nav, route guards, PermissionGate/PermissionButton, action gating across modules
- [x] **Spec 20 implemented** — Payslip PDF download (jspdf), report PDF export, CSV unchanged
- [x] **Spec 21 implemented** — Employee cancel pending expense claims, cancelled status/filters, sidebar user footer restored
- [x] **Spec 22 implemented** — Multi-company tenancy: company CRUD, switcher, companyId scoping, co-2 seed, register flow
- [x] **Spec 22b implemented** — Subdomain tenancy: hostname/`?tenant=` resolution, tenant-branded login, platform vs tenant auth, register redirect, topbar badge
- [x] **Spec 23 implemented** — Custom roles: create/duplicate/delete, permission matrix, Users role assignment, `customRoleId` on auth
- [x] **Spec 24 implemented** — Projects & tasks: CRUD, time logging, daily/project/task reports, company-scoped seed data
- [x] `specs/13-spec-company-settings.md` through `specs/16-spec-expenses.md` written
- [x] **Phase 2 specs drafted** — `17` Bank Accounts, `18` Org Chart, `19` Permission UI, `20` PDF Export, `21` Polish, `22–24` Phase 2/3 backlog

## In Progress

- Nothing in progress

## Next Up (recommended order)

| Priority | Spec | Title | Why |
| -------- | ---- | ----- | --- |
| 1 | **22d** | Tenant Isolation Hardening | Fix scoping gaps in tickets, recruitment, attendance, org chart, bank accounts, reports |
| 2 | **25** | Tenant Onboarding Wizard | Register → usable workspace |
| 3 | **26** | Bulk Invite & CSV Import | Customer migration |
| 4 | **27** | Plan Limits & Billing UI | Monetization; activate `plan` field |
| 5 | **28** | Audit Log | Compliance; replace static user-activity report |
| 6 | **29** | Holiday Calendar | Per-company attendance holidays |
| 7 | **22c** | Custom Domains | Enterprise hostname branding |
| 8 | **30** | Platform Admin Console | Operator view across tenants |
| 9 | **31** | Security & SSO Settings | Enterprise security checklist |
| 10 | **32** | Data Export & API Keys | Integrations + offboarding |
| 11 | **Backend** | Real API | Replace mock stores with production backend |

SaaS Phase 3 specs drafted in `context/specs/` (22c, 22d, 25–32).

## Open Questions

- [x] **API backend**: Frontend-only — mock APIs in `src/api/`.
- [x] **Auth provider**: Simulated JWT via mock API + Zustand persist.
- [x] **Payroll computation**: Resolved in Spec 09 — mock API computes net pay; UI displays only.
- [x] **Export format for reports**: CSV in v1; PDF → Spec 20.
- [x] **Company multi-tenancy**: Spec 22 implemented — two companies, switcher, scoped mock APIs.
- [x] **Subdomain tenancy**: Spec 22b implemented — `{slug}.domain` hostname resolution, tenant-branded login.
- [x] **Custom roles**: Spec 23 implemented — create custom roles with permission matrices and user assignment.
- [x] **Projects & tasks**: Spec 24 implemented — projects, tasks, time logs, daily/project/task reports.

## Architecture Decisions

- **MVVM pattern adopted** — Separates rendering from logic. Every page has a paired `.viewmodel.ts` hook. Views are JSX-only.
- **TanStack Query for server state** — Avoids duplicating remote data in Zustand. Zustand is reserved for auth, UI, and ephemeral state.
- **Zod at all API boundaries** — All API responses parsed with Zod before use. Prevents runtime type errors from propagating into the UI.
- **Tailwind + CSS custom properties** — Design tokens live in CSS variables, mapped into Tailwind theme config. Enables consistent theming without arbitrary value overuse.
- **Frontend-only v1** — No backend development; API calls use mock data until a real backend is available.
- **Subdomain tenancy (22b)** — Tenant resolved from hostname or dev `?tenant=` param; platform host keeps Super Admin switcher; tenant hosts hide switcher and enforce company-scoped login.
- **Custom roles (23)** — System roles use `role` enum; custom roles use `customRoleId` + employee base role; permissions resolved via role store.
- **Projects module (24)** — Single `projects` permission module covers projects, tasks, and time logging; reports fed from shared time log store.

## Session Notes

- Spec 02 mock credentials:
  - `admin@smarthr.com` / `password123` → hr_admin (SmartHR Inc.; platform login redirects to tenant URL)
  - `super@smarthr.com` / `password123` → super_admin (platform host only; company switcher)
  - `employee@smarthr.com` / `password123` → employee (SmartHR Inc.; profile at `/employees/usr-employee-1`)
  - `admin@acme.com` / `password123` → hr_admin (Acme Corp — use `?tenant=acme` or `acme.localhost`)
  - `employee@acme.com` / `password123` → employee (Acme Corp)
  - `2fa@smarthr.com` / `password123` → requires 2FA (code: `123456`)
- **Dev tenant testing:** `http://localhost:5173/login?tenant=acme` or add `127.0.0.1 acme.localhost` to `/etc/hosts`
- **Projects:** Sidebar → Projects / Tasks; Reports → Daily Time, Project, Task reports
- Specs 17–24 live in `context/specs/` — all Phase 2/3 frontend specs implemented.
- Spec 09 `bankAccountLast4` on salary records is legacy; Spec 17 bank accounts store is the source of truth for payout display.
