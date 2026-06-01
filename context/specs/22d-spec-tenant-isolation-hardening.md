# Spec 22d — Tenant Isolation Hardening (Phase 3)

## Goal

Close remaining multi-company data leaks introduced during incremental Spec 22
adoption. Every mock API read/write must scope to the active tenant (`companyId`)
derived from hostname, auth user, or Super Admin switcher (Spec 22b).

**Phase 3 spec — depends on Spec 22 and Spec 22b (implemented).**

This is a correctness pass, not new product UI. Required before onboarding real
customers or building Specs 25–32.

---

## Problem

Spec 22 added `companyId` and `filterByCompany()` to core HR modules, but several
stores were seeded or queried without tenant filtering:

| Module | Gap |
| ------ | --- |
| **Tickets** | `getTickets()` / status counts lack `companyId` filter; seeds hardcoded to `co-1` |
| **Recruitment** | Job postings seeded as `co-1` only; list APIs not company-scoped |
| **Attendance** | List/export does not filter by active company |
| **Org chart** | Tree built from all employees regardless of tenant |
| **Bank accounts** | List/CRUD not scoped by company |
| **Reports** | Aggregations ignore active company; user-activity is static mock |

Additionally, module-level seed initialization must **never** call
`getActiveCompanyIdSync()` at import time (circular / wrong-tenant bugs).

---

## Architecture Decisions

- **Single helper pattern** — All list endpoints call
  `filterByCompany(store, companyId ?? getActiveCompanyIdSync())`.
- **Explicit seed company** — Seed functions accept `companyId: string` parameter;
  module init passes `'co-1'` / `'co-2'` explicitly, never runtime context.
- **Cross-tenant write guard** — Create/update validates `employee.companyId ===
  getActiveCompanyIdSync()` before persisting related records.
- **Acme demo data** — Extend seeds for `co-2` in tickets, recruitment, attendance,
  bank accounts so `?tenant=acme` demos are realistic.
- **No new routes** — API-layer and seed fixes only.

---

## Modules to Update

### `tickets.api.ts`

- Add `companyId` to ticket records if missing on nested `ticket` object.
- `filterTickets()` — prepend company filter.
- `computeStatusCounts()` — scope to active company.
- `seedTickets('co-1')` and `seedTickets('co-2')` with distinct subjects/assignees.
- `createTicket()` — set `companyId` from creator's employee record.

### `recruitment.api.ts`

- Seed jobs for both `co-1` and `co-2`.
- Filter `jobStore`, `candidateStore`, `referralStore` by company on all reads.
- `createJobPosting()` — inherit `companyId` from department or active tenant.

### `attendance.api.ts`

- `ensureMonthData()` — only generate records for employees in target company.
- `getAttendanceRecords()` — filter by `companyId` (via employee lookup or field on record).
- Export functions scoped to active company.

### `org-chart.api.ts`

- Pass `companyId` into tree builder; filter employees before hierarchy build.
- Admin and employee views both respect tenant.

### `bank-accounts.api.ts`

- Add `filterByCompany` to all list/get operations.
- Seed at least one account per employee in `co-2` demo set.

### `reports.api.ts`

- Every report generator accepts optional `companyId`; defaults to
  `getActiveCompanyIdSync()`.
- Wire employee, attendance, leave, payslip, payment, expense reports through
  already-scoped module APIs (do not read global stores directly).

---

## Seed Pattern (mandatory)

```ts
// ❌ Wrong — runs at module load, wrong tenant / TDZ risk
const employees = getAllEmployeesForPayroll()

// ✅ Correct — explicit company at seed time
function seedTickets(companyId: string) {
  const employees = getAllEmployeesForPayroll(companyId)
  // ...
}
seedTickets('co-1')
seedTickets('co-2')
```

Document this pattern in a one-line comment at top of each affected API file.

---

## Acceptance Criteria

1. Login as `admin@acme.com` on `?tenant=acme` — Tickets, Recruitment, Attendance,
   Org Chart, Bank Accounts show **Acme-only** data (no SmartHR Inc. rows).
2. Super Admin on platform host switching companies updates all above modules.
3. Status counts, report previews, and CSV exports match filtered tenant data.
4. No module calls `getActiveCompanyIdSync()` during top-level seed initialization.
5. `co-2` has non-empty seed data in every listed module.
6. Attempting to reference an employee from another company in create/update throws
   or returns a validation error (mock 403 message).
7. `npm run build` passes with zero TypeScript errors.

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | `?tenant=acme` → Tickets | Only Acme tickets (or empty state, not co-1) |
| 2 | Same → Recruitment jobs | Acme jobs only |
| 3 | Same → Attendance admin view | Acme employees only |
| 4 | Same → Org chart | Acme hierarchy only |
| 5 | Platform super admin switch co-1 ↔ co-2 | Data swaps correctly |
| 6 | Reports → Employee report on Acme | Count matches Acme employee list |

---

## Out of Scope

- New UI pages or settings
- Backend middleware (`X-Tenant-Id` header) — document as future contract only
- Row-level security audit for every edge case in payroll/leaves (already scoped)

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22** | Required — `companyId`, switcher |
| **22b** | Required — hostname tenant resolution |
| **25+** | Blocked until this spec ships |

**Recommended priority:** P0 — ship before any new SaaS features.
