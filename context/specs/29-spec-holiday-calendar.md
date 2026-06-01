# Spec 29 — Holiday Calendar (Phase 3)

## Goal

Let each company define **public holidays** used by Attendance (Spec 07) and
Leave (Spec 08). Different tenants in different countries need different holiday
sets; hardcoded weekend-only logic is insufficient for SaaS.

**Phase 3 spec — depends on Spec 07, Spec 22, Spec 13 (timezone).**

---

## Problem

Attendance records can have `status: holiday` but there is no admin UI to
configure which dates are holidays. All companies share implicit calendar logic.
Acme (US) and a future EU tenant need separate holiday calendars.

---

## Architecture Decisions

- **Per-company holiday list** — `HolidaySchema` includes `companyId`.
- **Annual + one-off** — support fixed date (Dec 25) and one-off dates (2026-03-15).
- **Attendance integration** — when generating/viewing attendance for a date,
  if date matches company holiday → default status `holiday` (override still allowed).
- **Leave integration** — applying leave on a holiday date shows warning (non-blocking).
- **Import template** — optional CSV: `date,name,isRecurring` (recurring = same MD every year).

Seed: US federal holidays for `co-1`, subset for `co-2` (Texas-specific optional mock).

---

## Routes

| Path | Page | Role |
| ---- | ---- | ---- |
| `/settings/holidays` | `HolidayCalendarPage` | super_admin, hr_admin |

Add under Settings nav after Company Settings.

---

## File Structure

```
src/
├── pages/
│   └── Settings/
│       ├── HolidayCalendarPage.tsx
│       ├── HolidayCalendarPage.viewmodel.ts
│       └── components/
│           ├── HolidayTable.tsx
│           ├── HolidayFormModal.tsx
│           ├── HolidayYearSelector.tsx
│           └── HolidayCalendarPreview.tsx   ← optional mini month grid
├── api/
│   └── holidays.api.ts
└── types/
    └── holiday.types.ts
```

---

## Types

```ts
export const HolidaySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  date: z.string(),              // ISO date YYYY-MM-DD (instance) OR MM-DD if recurring
  isRecurring: z.boolean(),      // if true, applies every year on month-day
  isPaid: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const HolidayFormSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  isRecurring: z.boolean(),
  isPaid: z.boolean(),
})
```

---

## API Functions

```ts
getHolidays(params?: { companyId?: string; year?: number }): Promise<Holiday[]>
createHoliday(input: HolidayFormInput): Promise<Holiday>
updateHoliday(id: string, input: HolidayFormInput): Promise<Holiday>
deleteHoliday(id: string): Promise<void>
isHoliday(date: string, companyId?: string): Promise<boolean>
getHolidaysForMonth(year: number, month: number, companyId?: string): Promise<Holiday[]>
```

Helper exported for attendance module:

```ts
export function resolveHolidayStatus(
  date: string,
  companyId: string,
): 'holiday' | null
```

---

## Attendance Integration (`attendance.api.ts`)

- `ensureMonthData()` — after generating rows, call `resolveHolidayStatus` for each
  date/employee; set status to `holiday` where applicable (unless leave overrides).
- Admin manual edit still allowed.

---

## UI — Holiday Calendar Page

### Header
- Year selector (2025–2027)
- `[Add Holiday]` button
- `[Import CSV]` optional (reuse Spec 26 csv utils, simplified)

### Table
| Name | Date | Recurring | Paid | Actions |
| ---- | ---- | --------- | ---- | ------- |

### Add/Edit modal
- Name, date picker, recurring toggle, paid toggle
- Recurring: store as `MM-DD` internally or flag + normalise on save

### Empty state
- "No holidays configured — attendance will only mark weekends off."

---

## Acceptance Criteria

1. HR Admin can CRUD holidays for their company only.
2. Attendance admin view shows `holiday` status on configured dates after regen/refresh.
3. Recurring holiday appears in every selected year view.
4. Acme holidays not visible when managing SmartHR company (super admin switch).
5. Delete holiday removes holiday status from future attendance (mock regen on next fetch).
6. `npm run build` passes.

---

## Out of Scope

- Regional auto-import (Google Public Holidays API)
- Holiday approval workflow
- Different holiday sets per office location
- Automatic leave balance adjustment on holidays
- iCal sync

---

## Dependencies

| Spec | Relationship |
| ---- | ------------ |
| **07** | Attendance status |
| **08** | Leave date validation (warning only) |
| **22 / 22d** | Company scoping |
| **26** | Optional CSV import pattern |

---

## Test Plan (manual)

| Step | Action | Expected |
| ---- | ------ | -------- |
| 1 | Add "Independence Day" recurring Jul 4 for Acme | Appears in 2025 and 2026 views |
| 2 | Open Attendance July 2026 on Acme | Jul 4 rows show Holiday |
| 3 | co-1 without same holiday | Jul 4 not auto-holiday for SmartHR |
