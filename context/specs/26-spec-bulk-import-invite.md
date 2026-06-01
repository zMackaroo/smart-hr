# Spec 26 — Bulk Invite & CSV Import (Phase 3)

## Goal

Enable HR Admins to **invite platform users** and **import employees** in bulk
via CSV upload. Critical for migrating another company's workforce into SmartHR
without one-by-one data entry.

**Phase 3 spec — depends on Spec 15 (Users), Spec 05 (Employees), Spec 22.**

---

## Problem

Spec 15 supports single-user create with optional invite email (toast only).
Real customers arrive with 50–500 employee rows in spreadsheets. Manual entry
blocks SaaS adoption and onboarding (Spec 25 Team step).

---

## Architecture Decisions

- **Client-side CSV parse** — use native `FileReader` + manual CSV parser or
  lightweight lib (prefer no new dependency: split lines, handle quoted fields).
- **Preview before commit** — show validation table with row-level errors; only
  valid rows import on confirm.
- **Mock email** — successful invites toast "Invitation sent to {email}" (same
  as Spec 15); no real SMTP.
- **Company scoped** — all imported records get `companyId` from active tenant.
- **Idempotency (mock)** — duplicate email within batch flagged; existing user
  email in same company flagged as skip/update choice.

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/users/import` | `UserImportPage` | super_admin, hr_admin |
| `/employees/import` | `EmployeeImportPage` | super_admin, hr_admin |

Entry points:
- Users page → `[Import CSV]` button
- Employees page → `[Import CSV]` button
- Onboarding Team step (Spec 25) → link to user import

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       └── UserImportPage.tsx (+ .viewmodel.ts)
├── pages/
│   └── Employees/
│       └── EmployeeImportPage.tsx (+ .viewmodel.ts)
├── components/
│   └── import/
│       ├── CsvUploadDropzone.tsx
│       ├── ImportPreviewTable.tsx
│       ├── ImportRowStatusBadge.tsx
│       └── ImportSummaryBanner.tsx
├── utils/
│   └── csv-import.utils.ts
├── api/
│   ├── users.api.ts          ← bulkInviteUsers()
│   └── employees.api.ts      ← bulkImportEmployees()
└── types/
    └── import.types.ts
```

---

## CSV Templates

### User invite template

| Column | Required | Notes |
| ------ | -------- | ----- |
| name | yes | |
| email | yes | unique per company |
| role | yes | `hr_admin` \| `employee` |
| employee_id | no | link to existing employee record |

Download `[Download template]` generates sample CSV from constants.

### Employee import template

| Column | Required | Notes |
| ------ | -------- | ----- |
| employee_id | yes | e.g. EMP-001 |
| first_name | yes | |
| last_name | yes | |
| email | yes | |
| department | yes | must match existing dept name or auto-create flag |
| designation | yes | |
| join_date | yes | ISO or configurable format from company settings |
| phone | no | |

Option: **Auto-create departments** toggle (default off) — unknown department
names create new departments during import.

---

## Types

```ts
export type ImportRowStatus = 'valid' | 'warning' | 'error'

export const ImportPreviewRowSchema = z.object({
  rowNumber: z.number(),
  status: z.enum(['valid', 'warning', 'error']),
  messages: z.array(z.string()),
  data: z.record(z.string()),
})

export const BulkImportResultSchema = z.object({
  created: z.number(),
  skipped: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ rowNumber: z.number(), message: z.string() })),
})
```

---

## API Functions

```ts
// users.api.ts
bulkInviteUsers(rows: UserInviteRow[]): Promise<BulkImportResult>

// employees.api.ts
bulkImportEmployees(
  rows: EmployeeImportRow[],
  options?: { autoCreateDepartments?: boolean },
): Promise<BulkImportResult>
```

Validation runs server-side in mock API (mirror client preview). Max 500 rows
per batch (mock limit).

---

## UI Flow

1. **Upload** — drag-drop or file picker; accept `.csv` only
2. **Map columns** (if headers differ) — optional simple dropdown mapping UI
3. **Preview** — paginated table, colour-coded rows, error messages column
4. **Confirm** — summary counts → `[Import N employees]`
5. **Result** — success banner + link to Users/Employees list; downloadable error report CSV

---

## Acceptance Criteria

1. HR Admin can download CSV template for users and employees.
2. Invalid rows shown before import; valid rows import successfully.
3. Imported employees appear only in active company tenant.
4. Duplicate emails within company rejected with clear row error.
5. User invite import creates `status: invited` users (Spec 15).
6. Import of 0 valid rows blocked with message.
7. `npm run build` passes.

---

## Out of Scope

- Excel (.xlsx) upload
- Scheduled / background imports
- HRIS API connectors (Workday, BambooHR)
- Photo/avatar bulk upload
- Real email delivery

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **05, 06, 15** | Employee, dept, user APIs |
| **22 / 22d** | Company scoping |
| **25** | Optional entry from onboarding |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Upload 5-row valid employee CSV on Acme | 5 Acme employees created |
| 2 | Upload CSV with duplicate email | Row errors, partial import if configured |
| 3 | Switch to co-1 | Imported Acme employees not visible |
| 4 | User import with 3 invites | 3 invited users in Users table |
