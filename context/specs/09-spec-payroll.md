# Spec 09 — Payroll (Salary, Payslip, Provident Fund)

## Goal

Build the Payroll module covering employee salary configuration, payslip
generation/viewing, and provident fund (PF) management. Admins configure salaries
and manage PF contributions org-wide. Employees view and download their own
payslips.

**Implementation note:** This spec spans three sidebar routes. Implement as three
separate sessions in this order: (1) Employee Salary, (2) Payslip, (3) Provident
Fund. Do not combine all three in a single PR.

**Architecture decision (resolves open question):** Salary computation happens in
the mock API layer — the frontend displays computed values only. Net pay,
deductions, and PF contributions are calculated server-side (simulated in
`src/api/`) and returned as typed responses. The UI must not duplicate payroll
math.

**Out of scope for this spec:** `/payroll/expenses` (Expense Claims) — deferred
to a follow-up spec. Route stub may remain until then.

---

## Routes

| Path                 | Page                   | Role                              |
| -------------------- | ---------------------- | --------------------------------- |
| `/payroll/salary`    | `EmployeeSalaryPage`   | hr_admin, super_admin             |
| `/payroll/payslip`   | `PayslipPage`          | hr_admin, super_admin, employee   |
| `/payroll/provident` | `ProvidentFundPage`    | hr_admin, super_admin             |

`PayslipPage` renders `<AdminPayslipView>` or `<EmployeePayslipView>` based on
role. Salary and PF pages are admin-only.

---

## File Structure

```
src/
├── pages/
│   └── Payroll/
│       ├── EmployeeSalaryPage.tsx
│       ├── EmployeeSalaryPage.viewmodel.ts
│       ├── PayslipPage.tsx
│       ├── PayslipPage.viewmodel.ts
│       ├── ProvidentFundPage.tsx
│       ├── ProvidentFundPage.viewmodel.ts
│       └── components/
│           ├── SalaryTable.tsx
│           ├── SalaryFormModal.tsx
│           ├── SalaryBreakdownPanel.tsx
│           ├── AdminPayslipView.tsx
│           ├── AdminPayslipView.viewmodel.ts
│           ├── EmployeePayslipView.tsx
│           ├── EmployeePayslipView.viewmodel.ts
│           ├── PayslipCard.tsx
│           ├── PayslipDetailModal.tsx
│           ├── PayslipPreview.tsx
│           ├── ProvidentFundTable.tsx
│           ├── ProvidentFundSummaryCards.tsx
│           └── ProvidentFundSettingsModal.tsx
├── api/
│   └── payroll.api.ts
└── types/
    └── payroll.types.ts
```

---

## Zod Schemas & Types (`payroll.types.ts`)

```ts
export type PayFrequency = 'monthly' | 'bi_weekly' | 'weekly'
export type PayslipStatus = 'draft' | 'processed' | 'paid'
export type PfContributionStatus = 'active' | 'paused' | 'closed'

export const SalaryComponentSchema = z.object({
  id: z.string(),
  label: z.string(),           // "Housing Allowance", "Tax", etc.
  amount: z.number(),
  type: z.enum(['earning', 'deduction']),
})

export const EmployeeSalarySchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    designation: z.string(),
  }),
  baseSalary: z.number(),
  components: z.array(SalaryComponentSchema),
  grossSalary: z.number(),       // computed by API
  totalDeductions: z.number(), // computed by API
  netSalary: z.number(),         // computed by API
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']),
  effectiveFrom: z.string(),     // ISO date
  bankAccountLast4: z.string().optional(),
  currency: z.string().default('USD'),
  updatedAt: z.string(),
})

export const SalaryFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  baseSalary: z.number().min(0, 'Base salary must be positive'),
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  bankAccountLast4: z.string().length(4).optional().or(z.literal('')),
  components: z.array(z.object({
    label: z.string().min(1, 'Label is required'),
    amount: z.number().min(0),
    type: z.enum(['earning', 'deduction']),
  })),
})

export const PayslipSchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    department: z.string(),
    designation: z.string(),
  }),
  payPeriod: z.object({
    month: z.number(),           // 1–12
    year: z.number(),
    label: z.string(),           // "June 2026"
  }),
  baseSalary: z.number(),
  earnings: z.array(SalaryComponentSchema),
  deductions: z.array(SalaryComponentSchema),
  grossPay: z.number(),
  totalDeductions: z.number(),
  netPay: z.number(),
  pfEmployeeContribution: z.number(),
  pfEmployerContribution: z.number(),
  status: z.enum(['draft', 'processed', 'paid']),
  paymentDate: z.string().nullable(),
  generatedAt: z.string(),
})

export const ProvidentFundRecordSchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  employeeContributionRate: z.number(),  // percentage, e.g. 5
  employerContributionRate: z.number(),  // percentage, e.g. 5
  employeeContributionAmount: z.number(),
  employerContributionAmount: z.number(),
  totalBalance: z.number(),
  status: z.enum(['active', 'paused', 'closed']),
  enrolledDate: z.string(),
  lastContributionDate: z.string().optional(),
})

export const ProvidentFundSummarySchema = z.object({
  totalEmployees: z.number(),
  activeAccounts: z.number(),
  totalEmployeeContributions: z.number(),
  totalEmployerContributions: z.number(),
  totalFundBalance: z.number(),
})

export const PfSettingsFormSchema = z.object({
  defaultEmployeeRate: z.number().min(0).max(100),
  defaultEmployerRate: z.number().min(0).max(100),
})
```

---

## API Functions (`payroll.api.ts`)

```ts
// ── Employee Salary (admin) ──────────────────────────────────────────────

getEmployeeSalaries(params?: {
  search?: string
  departmentId?: string
  page?: number
  perPage?: number
}): Promise<{ data: EmployeeSalary[]; total: number; page: number; totalPages: number }>
  GET /api/payroll/salaries

getEmployeeSalary(employeeId: string): Promise<EmployeeSalary>
  GET /api/payroll/salaries/:employeeId

createEmployeeSalary(data: SalaryFormInput): Promise<EmployeeSalary>
  POST /api/payroll/salaries

updateEmployeeSalary(id: string, data: SalaryFormInput): Promise<EmployeeSalary>
  PUT /api/payroll/salaries/:id

deleteEmployeeSalary(id: string): Promise<void>
  DELETE /api/payroll/salaries/:id

// ── Payslips ─────────────────────────────────────────────────────────────

getPayslips(params: {
  month?: number
  year?: number
  employeeId?: string       // admin filter
  departmentId?: string
  status?: PayslipStatus
  page?: number
  perPage?: number
}): Promise<{ data: Payslip[]; total: number; page: number; totalPages: number }>
  GET /api/payroll/payslips

getMyPayslips(params?: { month?: number; year?: number }): Promise<Payslip[]>
  GET /api/payroll/payslips/me

getPayslip(id: string): Promise<Payslip>
  GET /api/payroll/payslips/:id

generatePayslips(params: { month: number; year: number }): Promise<Payslip[]>
  POST /api/payroll/payslips/generate   // admin: bulk generate for all active employees

downloadPayslip(id: string): Promise<Blob>
  GET /api/payroll/payslips/:id/download  // returns CSV blob in v1 (PDF deferred)

markPayslipPaid(id: string): Promise<Payslip>
  PATCH /api/payroll/payslips/:id/mark-paid

// ── Provident Fund (admin) ───────────────────────────────────────────────

getProvidentFundRecords(params?: {
  search?: string
  departmentId?: string
  status?: PfContributionStatus
  page?: number
  perPage?: number
}): Promise<{ data: ProvidentFundRecord[]; total: number; summary: ProvidentFundSummary }>
  GET /api/payroll/provident-fund

getPfSettings(): Promise<{ defaultEmployeeRate: number; defaultEmployerRate: number }>
  GET /api/payroll/provident-fund/settings

updatePfSettings(data: PfSettingsFormInput): Promise<{ defaultEmployeeRate: number; defaultEmployerRate: number }>
  PUT /api/payroll/provident-fund/settings

updatePfRecordStatus(id: string, status: PfContributionStatus): Promise<ProvidentFundRecord>
  PATCH /api/payroll/provident-fund/:id/status
```

**Mock data notes:**
- Seed salary records for ~10 employees from `employees.api.ts` store.
- PF records auto-created when a salary is configured (enrolled with default rates).
- Payslip generation reads salary + attendance/leave deductions (mock: flat deductions
  optional) and computes net pay. Re-use employee IDs from existing mock store.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Currency values use `formatCurrency()` from `src/utils/currency.utils.ts`.
- Payslip amounts in detail/preview use `--font-mono` for numeric columns.
- Tables, modals, status badges, pagination, and empty states match Employees/Attendance modules.
- Primary CTA buttons use accent orange (`--accent-primary`).

---

## 1. Employee Salary Page UI

### Page Header
- Title: "Employee Salary"
- Breadcrumbs: `[Payroll] → [Employee Salary]`
- Right: `[+ Add Salary]` button

### Filter Bar
- Employee search input
- Department dropdown (from `departments.api.ts`)
- Showing count

### Table Columns
| Employee | Department | Base Salary | Gross | Net Salary | Pay Frequency | Effective From | Actions |
- Employee: avatar + name + employee ID
- Salary columns: formatted currency (`formatCurrency`)
- Actions: Edit icon, Delete icon

### Empty State
- "No salary records found" + "Add Salary" button

### Add / Edit Salary Modal
Fields:
- Employee (searchable select — only employees without an active salary record on Add)
- Base Salary (number input)
- Pay Frequency (select: Monthly / Bi-weekly / Weekly)
- Effective From (date)
- Bank Account Last 4 (optional, 4 digits)
- Earnings section: dynamic list of `{ label, amount }` rows with `[+ Add Earning]`
- Deductions section: dynamic list of `{ label, amount }` rows with `[+ Add Deduction]`
- Live preview panel (read-only): Gross, Total Deductions, Net — values from API
  response after save, or computed preview via a `previewSalary()` mock helper

### Delete Guard
- Confirm dialog: "Delete salary configuration for [Name]?"

---

## 2. Payslip Page UI

### Admin View

#### Page Header
- Title: "Payslips"
- Right: Month/Year picker + `[Generate Payslips]` button + `[Export CSV]` button

#### Filter Bar
- Employee search
- Department dropdown
- Status dropdown (All / Draft / Processed / Paid)

#### Table Columns
| Employee | Pay Period | Gross Pay | Deductions | Net Pay | PF (Emp) | Status | Actions |
- Actions: View (eye icon), Download (download icon), Mark Paid (check icon — only on `processed`)

#### Generate Payslips
- Confirm dialog: "Generate payslips for [Month Year] for all active employees?"
- Creates `draft` payslips; success toast on completion

#### Payslip Detail Modal
- Full payslip preview (`PayslipPreview` component):
  - Company header (static mock: "SmartHR Inc.")
  - Employee info block
  - Earnings table + Deductions table
  - Summary row: Gross, Deductions, PF contributions, Net Pay
  - Status badge + payment date
- Footer: `[Download]` + `[Mark as Paid]` (admin, if status = processed)

### Employee View

#### Page Header
- Title: "My Payslips"

#### Filter Bar
- Month/Year picker only

#### Payslip Cards (grid, 1 col mobile / 2 col tablet / 3 col desktop)
Each card shows:
- Pay period label (e.g. "June 2026")
- Net pay (large, bold, mono font)
- Status badge
- `[View Details]` + `[Download]` buttons

#### Payslip Detail Modal
- Same `PayslipPreview` as admin (read-only, no Mark Paid action)

---

## 3. Provident Fund Page UI

### Page Header
- Title: "Provident Fund"
- Right: `[PF Settings]` button (opens settings modal)

### Summary Cards (4 cards)
| Total Employees | Active Accounts | Employee Contributions | Total Fund Balance |
- Currency format for contribution/balance cards

### Filter Bar
- Employee search
- Department dropdown
- Status dropdown (All / Active / Paused / Closed)

### Table Columns
| Employee | Emp. Rate | Empl. Rate | Emp. Contribution | Empl. Contribution | Total Balance | Status | Actions |
- Rates shown as percentages (e.g. "5%")
- Actions: Pause/Resume toggle (changes status between active ↔ paused)

### PF Settings Modal
Fields:
- Default Employee Contribution Rate (%)
- Default Employer Contribution Rate (%)
- Note: "Applies to newly enrolled employees. Existing records are unchanged."

### Empty State
- "No PF records found" — shown when no salaries have been configured yet

---

## ViewModel Hooks

### `useEmployeeSalaryPageViewModel`
```ts
returns {
  salaries: EmployeeSalary[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  departments: Department[]
  page: number
  totalPages: number
  total: number
  onPageChange: (p: number) => void
  selectedSalary: EmployeeSalary | null
  isFormModalOpen: boolean
  isDeleteModalOpen: boolean
  openAddModal: () => void
  openEditModal: (salary: EmployeeSalary) => void
  openDeleteModal: (salary: EmployeeSalary) => void
  closeModal: () => void
  onSubmit: (data: SalaryFormInput) => void
  onConfirmDelete: () => void
  isSubmitting: boolean
}
```

### `usePayslipPageViewModel`
```ts
returns {
  isAdmin: boolean
}
```

### `useAdminPayslipViewModel`
```ts
returns {
  payslips: Payslip[]
  isLoading: boolean
  selectedMonth: number
  selectedYear: number
  setMonth: (m: number) => void
  setYear: (y: number) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  selectedStatus: PayslipStatus | ''
  setSelectedStatus: (s: PayslipStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  selectedPayslip: Payslip | null
  openDetailModal: (payslip: Payslip) => void
  closeDetailModal: () => void
  onGenerate: () => void
  onExport: () => void
  onDownload: (id: string) => void
  onMarkPaid: (id: string) => void
  isGenerating: boolean
  isExporting: boolean
}
```

### `useEmployeePayslipViewModel`
```ts
returns {
  payslips: Payslip[]
  isLoading: boolean
  selectedMonth: number
  selectedYear: number
  setMonth: (m: number) => void
  setYear: (y: number) => void
  selectedPayslip: Payslip | null
  openDetailModal: (payslip: Payslip) => void
  closeDetailModal: () => void
  onDownload: (id: string) => void
}
```

### `useProvidentFundPageViewModel`
```ts
returns {
  records: ProvidentFundRecord[]
  summary: ProvidentFundSummary | undefined
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedDepartment: string
  setSelectedDepartment: (id: string) => void
  selectedStatus: PfContributionStatus | ''
  setSelectedStatus: (s: PfContributionStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  isSettingsModalOpen: boolean
  openSettingsModal: () => void
  closeSettingsModal: () => void
  pfSettings: { defaultEmployeeRate: number; defaultEmployerRate: number } | undefined
  onSaveSettings: (data: PfSettingsFormInput) => void
  onToggleStatus: (id: string) => void
  isSubmitting: boolean
}
```

---

## Route Guards

Wrap in `RoleGuard` in `routes.tsx`:
- `/payroll/salary` → `['super_admin', 'hr_admin']`
- `/payroll/provident` → `['super_admin', 'hr_admin']`
- `/payroll/payslip` → all authenticated roles (no RoleGuard; role-split inside page)

---

## Acceptance Criteria

1. Admin can create, edit, and delete employee salary configurations.
2. Gross and net salary values are computed by the mock API, not the UI.
3. Admin can bulk-generate payslips for a selected month/year.
4. Employee sees only their own payslips; admin sees all employees' payslips.
5. Payslip detail modal displays earnings, deductions, PF contributions, and net pay.
6. Payslip download produces a CSV file with correct employee and pay data.
7. Admin can mark a processed payslip as paid; status badge updates immediately.
8. PF summary cards reflect totals from the filtered record set.
9. PF settings modal saves default contribution rates with success toast.
10. PF record status toggles between active and paused with confirmation.
11. All three pages show loading skeletons while data is fetching.
12. `npm run build` passes with zero TypeScript errors after implementation.
