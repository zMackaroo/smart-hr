# Spec 12 — Reports

## Goal

Build the Reports hub page. Admins browse available report types, apply filters,
preview report data in a table, and export results as CSV. This is the final
feature module — it aggregates data from all previously built modules via their
mock API stores.

**Architecture decision (resolves open question):** Export format is **CSV only**
in v1. PDF export is deferred. All export functions return a `Blob` with
`text/csv` MIME type, consistent with the Attendance export pattern.

**Implementation note:** Implement the Reports hub first, then add report types
incrementally in this priority order:
1. Employee Report
2. Attendance Report
3. Leave Report
4. Payslip Report
5. Payment Report
6. Expense Report (stub until Expenses spec exists — show "Coming soon" card)
7. User Activity Report

Daily / Project / Task reports from project-overview are **deferred** — not in v1
scope (no project/task modules exist).

---

## Routes

| Path       | Page           | Role                    |
| ---------- | -------------- | ----------------------- |
| `/reports` | `ReportsPage`  | hr_admin, super_admin   |

Single-page hub. No sub-routes. Report preview opens in a modal overlay.

---

## File Structure

```
src/
├── pages/
│   └── Reports/
│       ├── ReportsPage.tsx
│       ├── ReportsPage.viewmodel.ts
│       └── components/
│           ├── ReportTypeCard.tsx
│           ├── ReportPreviewModal.tsx
│           ├── ReportFilters.tsx
│           ├── ReportTable.tsx
│           └── ReportEmptyState.tsx
├── api/
│   └── reports.api.ts
└── types/
    └── report.types.ts
```

---

## Zod Schemas & Types (`report.types.ts`)

```ts
export type ReportType =
  | 'employee'
  | 'attendance'
  | 'leave'
  | 'payslip'
  | 'payment'
  | 'expense'
  | 'user_activity'

export const ReportMetaSchema = z.object({
  type: z.enum([
    'employee', 'attendance', 'leave', 'payslip',
    'payment', 'expense', 'user_activity',
  ]),
  title: z.string(),
  description: z.string(),
  icon: z.string(),              // lucide icon name (for reference)
  available: z.boolean(),        // false = "Coming soon" card
})

export const ReportFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  month: z.number().optional(),
  year: z.number().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.string().optional(),
})

export const ReportColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).default('left'),
})

export const ReportDataSchema = z.object({
  type: z.enum([
    'employee', 'attendance', 'leave', 'payslip',
    'payment', 'expense', 'user_activity',
  ]),
  title: z.string(),
  generatedAt: z.string(),
  filters: ReportFilterSchema,
  columns: z.array(ReportColumnSchema),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
  totalRows: z.number(),
})

export type ReportMeta = z.infer<typeof ReportMetaSchema>
export type ReportFilter = z.infer<typeof ReportFilterSchema>
export type ReportColumn = z.infer<typeof ReportColumnSchema>
export type ReportData = z.infer<typeof ReportDataSchema>
```

---

## API Functions (`reports.api.ts`)

```ts
getReportTypes(): Promise<ReportMeta[]>
  GET /api/reports/types

generateReport(params: {
  type: ReportType
  filters: ReportFilter
  page?: number
  perPage?: number
}): Promise<ReportData>
  POST /api/reports/generate

exportReport(params: {
  type: ReportType
  filters: ReportFilter
}): Promise<Blob>
  POST /api/reports/export   // returns CSV blob
```

**Mock implementation notes:**
Each report type reads from the corresponding module's mock store:

| Report Type     | Data Source                                      | Key Filters                        |
| --------------- | ------------------------------------------------ | ---------------------------------- |
| Employee        | `employees.api.ts` store                         | department, status                 |
| Attendance      | `attendance.api.ts` store                        | month/year, department, status     |
| Leave           | `leaves.api.ts` store                            | month/year, department, status     |
| Payslip         | `payroll.api.ts` payslip store                   | month/year, department             |
| Payment         | `payroll.api.ts` payslips with status=paid       | month/year, department             |
| Expense         | N/A (unavailable)                                | —                                  |
| User Activity   | Static mock activity log                         | dateFrom/dateTo, userId            |

`getReportTypes()` returns metadata for all 7 types; `expense` has `available: false`.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Hub page uses a responsive card grid (similar to Dashboard stat cards).
- Report preview modal is wide (`max-w-4xl`) to accommodate tables.
- Currency columns right-aligned; use `formatCurrency()` for display.
- Date columns formatted with `formatDate()`.

---

## Reports Hub Page UI

### Page Header
- Title: "Reports"
- Breadcrumbs: `[Reports] → [All Reports]`

### Report Type Grid
Responsive grid: 1 col mobile / 2 col tablet / 3 col desktop.

Each `ReportTypeCard`:
```
┌─────────────────────────────────────┐
│  [Icon]                             │
│                                     │
│  Employee Report                    │
│  View and export employee directory │
│  data with department filters.      │
│                                     │
│  [Generate Report →]                │
└─────────────────────────────────────┘
```

**Available cards:** clickable, "Generate Report →" link opens preview modal.

**Unavailable cards** (`available: false`):
- Greyed out (`opacity-50`)
- "Coming Soon" badge instead of action button
- Not clickable

### Report Types

| Type            | Title              | Icon (Lucide)   | Description                                      |
| --------------- | ------------------ | --------------- | ------------------------------------------------ |
| employee        | Employee Report    | Users           | Employee directory with department and status    |
| attendance      | Attendance Report  | Clock           | Monthly attendance records and summaries         |
| leave           | Leave Report       | CalendarDays    | Leave requests and balances by type              |
| payslip         | Payslip Report     | Receipt         | Payslip data for a selected pay period           |
| payment         | Payment Report     | Wallet          | Processed payment history                        |
| expense         | Expense Report     | CreditCard      | Expense claims summary (Coming soon)             |
| user_activity   | User Activity      | Activity        | User login and action audit log                  |

---

## Report Preview Modal UI

Opens when admin clicks "Generate Report" on a card.

### Modal Header
- Report title (e.g. "Employee Report")
- Close (X) button

### Filter Bar (`ReportFilters`)
Filters vary by report type:

| Report Type   | Filters                                              |
| ------------- | ---------------------------------------------------- |
| employee      | Department, Status                                   |
| attendance    | Month, Year, Department, Status                      |
| leave         | Month, Year, Department, Leave Status                |
| payslip       | Month, Year, Department                              |
| payment       | Month, Year, Department                              |
| user_activity | Date From, Date To, Employee (optional)              |

- `[Apply Filters]` button (primary)
- Filters persist while modal is open

### Report Table (`ReportTable`)
- Dynamic columns from `ReportData.columns`
- Paginated (20 rows per page)
- Row count label: "Showing X of Y records"
- Right-aligned numeric/currency columns

### Modal Footer
- Left: "Generated at [timestamp]"
- Right: `[Export CSV]` button (primary outline) + `[Close]` button

### Loading State
- Skeleton table rows while `generateReport` is in flight
- Export button disabled while loading or when `totalRows === 0`

### Empty State
- "No data found for the selected filters" with suggestion to adjust filters

---

## Report-Specific Column Definitions

### Employee Report
| Employee ID | Name | Email | Department | Designation | Status | Join Date |

### Attendance Report
| Employee | Department | Date | Check In | Check Out | Working Hours | Status |

### Leave Report
| Employee | Department | Leave Type | From | To | Days | Status | Applied On |

### Payslip Report
| Employee | Department | Pay Period | Gross Pay | Deductions | Net Pay | Status |

### Payment Report
| Employee | Department | Pay Period | Net Pay | Payment Date | Status |

### User Activity Report
| User | Role | Action | Module | Timestamp | IP Address |

---

## ViewModel Hook

### `useReportsPageViewModel`
```ts
returns {
  reportTypes: ReportMeta[]
  isLoadingTypes: boolean
  selectedReportType: ReportType | null
  isPreviewModalOpen: boolean
  openPreview: (type: ReportType) => void
  closePreview: () => void
  reportData: ReportData | undefined
  isGenerating: boolean
  filters: ReportFilter
  setFilters: (filters: ReportFilter) => void
  onApplyFilters: () => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onExport: () => void
  isExporting: boolean
  departments: Department[]
}
```

---

## Route Guards

Wrap in `RoleGuard` in `routes.tsx`:
- `/reports` → `['super_admin', 'hr_admin']`

---

## CSV Export Format

- First row: column headers from `ReportData.columns[].label`
- Subsequent rows: cell values as strings
- Filename pattern: `{report-type}-report-{YYYY-MM-DD}.csv`
- UTF-8 encoding with BOM for Excel compatibility
- All values double-quoted (consistent with Attendance export)

---

## Acceptance Criteria

1. Reports hub displays all 7 report type cards in a responsive grid.
2. Unavailable report types (Expense) show "Coming Soon" and are not clickable.
3. Clicking an available report type opens the preview modal with default filters.
4. Apply Filters fetches and displays paginated report data in a dynamic table.
5. Each report type shows the correct columns and data from its source mock store.
6. Export CSV downloads a valid file with correct headers and row data.
7. Export is disabled when no data is available for the selected filters.
8. Pagination works within the preview modal.
9. Loading skeleton displays while report data is generating.
10. Empty state shows when filters return zero rows.
11. Only `hr_admin` and `super_admin` can access `/reports`.
12. `npm run build` passes with zero TypeScript errors after implementation.
