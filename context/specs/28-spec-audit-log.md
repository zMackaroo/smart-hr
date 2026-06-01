# Spec 28 — Audit Log (Phase 3)

## Goal

Replace the static **User Activity** report (Spec 12) with a real, append-only
**audit log** scoped per company. Admins review who did what and when for
security, compliance, and troubleshooting.

**Phase 3 spec — depends on Spec 22, 22d, Spec 12 (Reports).**

---

## Problem

Spec 12 user-activity report uses hardcoded mock rows unrelated to actual app
actions. Multi-tenant SaaS customers expect immutable audit trails for logins,
permission changes, payroll runs, and data exports.

---

## Architecture Decisions

- **Append-only store** — `auditLogStore: AuditEntry[]`; no update/delete in mock API
  (backend: WORM / partitioned table).
- **Company scoped** — every entry has `companyId`; filtered by active tenant.
- **Actor + resource** — who performed action, on what entity, from which IP (mock).
- **Instrumentation** — helper `recordAudit(event)` called from existing API
  mutation functions (auth, users, employees, payroll, permissions, billing, export).
  Centralise in `audit.api.ts` to avoid duplication.
- **Reports integration** — User Activity report reads from audit store; add dedicated
  **Audit Log** settings page for searchable history.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/audit-log` | `AuditLogPage` | super_admin, hr_admin |
| `/reports` | (existing) | user_activity report → audit data |

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── AuditLogPage.tsx
│       ├── AuditLogPage.viewmodel.ts
│       └── components/
│           ├── AuditLogTable.tsx
│           ├── AuditLogFilters.tsx
│           └── AuditActionBadge.tsx
├── api/
│   └── audit.api.ts
├── types/
│   └── audit.types.ts
└── utils/
    └── audit-record.utils.ts          ← recordAudit() wrapper
```

---

## Types

```ts
export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'user.created'
  | 'user.updated'
  | 'user.deactivated'
  | 'employee.created'
  | 'employee.deleted'
  | 'permission.updated'
  | 'payroll.processed'
  | 'settings.updated'
  | 'data.exported'
  | 'billing.plan_changed'
  // extend as modules instrument

export const AuditEntrySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  action: z.string(),
  actor: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  resource: z.object({
    type: z.string(),
    id: z.string().optional(),
    label: z.string().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string(),
})
```

---

## API Functions

```ts
recordAudit(input: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<void>
getAuditLog(params?: {
  companyId?: string
  search?: string
  action?: string
  actorId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}): Promise<AuditLogListResponse>
exportAuditLogCsv(params): Promise<Blob>
```

Seed ~20 entries per company covering common actions.

---

## Instrumentation (minimum set)

Call `recordAudit` from:

| API | Actions |
| --- | ------- |
| `auth.api.ts` | login success, login failed, logout |
| `users.api.ts` | create, update, deactivate |
| `employees.api.ts` | create, update, delete |
| `permissions.api.ts` | role permission save |
| `payroll.api.ts` | payslip generate / payroll run |
| `company.api.ts` | settings save |
| `reports.api.ts` | CSV/PDF export |
| `billing.api.ts` | plan change (Spec 27) |

Use fire-and-forget in mock (await optional); must not break primary mutation on audit failure.

---

## UI — Audit Log Page

### Filters
- Date range picker
- Action type dropdown (grouped: Auth, Users, HR, Payroll, Settings)
- Actor search (autocomplete from company users)
- Free-text search (resource label, email)

### Table columns
- Timestamp (company timezone from Spec 13)
- Actor (name + email)
- Action (badge with colour by category)
- Resource
- IP (mock `127.0.0.1` or generated)

### Actions
- `[Export CSV]` — same filters applied
- Pagination (20 per page)

---

## Reports — User Activity

Update `reports.api.ts` user_activity generator to delegate to `getAuditLog()`.
Remove static mock rows.

---

## Acceptance Criteria

1. Login as Acme admin generates audit entry visible on Audit Log page.
2. Acme admin cannot see SmartHR audit entries.
3. Filters reduce results correctly.
4. User Activity report matches Audit Log data for same date range.
5. At least 8 action types instrumented across APIs.
6. CSV export includes filtered rows.
7. `npm run build` passes.

---

## Out of Scope

- Real IP/geo capture from request headers
- Audit log retention policies / auto-purge UI
- SIEM webhook forwarding
- Tamper-proof cryptographic signing
- Employee-visible audit (admin only)

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **22 / 22d** | Company scoping |
| **12** | User activity report |
| **27** | billing.plan_changed events |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Login as admin@acme.com | auth.login entry for co-2 |
| 2 | Create employee | employee.created entry |
| 3 | Filter action = auth | Login entries only |
| 4 | Reports → User activity | Same entries as settings page |
