# Spec 16 — Expense Claims

## Goal

Build the Expense Claims module at `/payroll/expenses`. Employees submit expense
claims with receipts; HR Admins review, approve, reject, and mark claims as
reimbursed. Enables the deferred **Expense Report** in Spec 12 (`available: true`
after this spec ships).

**Implementation note:** Implement in order: (1) types + API, (2) employee
submit/view, (3) admin approve/reject/reimburse. Follow the Leaves module
role-split pattern (`AdminExpensesView` / `EmployeeExpensesView`).

**Architecture decision:** Expense amounts are stored and displayed in company
currency from Spec 13 (`company.api.ts`). Mock API validates amount > 0; no tax
calculation in v1.

---

## Routes

| Path                | Page           | Role                              |
| ------------------- | -------------- | --------------------------------- |
| `/payroll/expenses` | `ExpensesPage` | hr_admin, super_admin, employee   |

`ExpensesPage` renders `<AdminExpensesView>` or `<EmployeeExpensesView>` based
on role (same pattern as `LeavesPage`).

---

## File Structure

```
src/
├── pages/
│   └── Payroll/
│       ├── ExpensesPage.tsx
│       ├── ExpensesPage.viewmodel.ts
│       └── components/
│           ├── AdminExpensesView.tsx
│           ├── AdminExpensesView.viewmodel.ts
│           ├── EmployeeExpensesView.tsx
│           ├── EmployeeExpensesView.viewmodel.ts
│           ├── ExpenseClaimTableRow.tsx
│           ├── ExpenseClaimCard.tsx
│           ├── SubmitExpenseModal.tsx
│           ├── ExpenseDetailModal.tsx
│           ├── RejectExpenseModal.tsx
│           ├── ExpenseStatusBadge.tsx
│           └── ExpenseCategoryBadge.tsx
├── api/
│   └── expenses.api.ts
└── types/
    └── expense.types.ts
```

Update `src/api/reports.api.ts`: set expense report `available: true` and wire
`generateReport` / `exportReport` for type `expense`.

---

## Zod Schemas & Types (`expense.types.ts`)

```ts
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed'
export type ExpenseCategory =
  | 'travel'
  | 'meals'
  | 'supplies'
  | 'accommodation'
  | 'transport'
  | 'other'

export const ExpenseClaimSchema = z.object({
  id: z.string(),
  claimNumber: z.string(),           // "EXP-0042"
  employee: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    employeeId: z.string(),
  }),
  category: z.enum(['travel', 'meals', 'supplies', 'accommodation', 'transport', 'other']),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  expenseDate: z.string(),           // ISO date
  receiptUrl: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'reimbursed']),
  submittedDate: z.string(),
  reviewedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  reviewedDate: z.string().optional(),
  rejectionReason: z.string().optional(),
  reimbursedDate: z.string().optional(),
})

export const SubmitExpenseFormSchema = z.object({
  category: z.enum(['travel', 'meals', 'supplies', 'accommodation', 'transport', 'other']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  receipt: z.instanceof(File).optional(),
}).refine(d => new Date(d.expenseDate) <= new Date(), {
  message: 'Expense date cannot be in the future',
  path: ['expenseDate'],
})

export const RejectExpenseFormSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required'),
})

export const ExpenseListResponseSchema = z.object({
  data: z.array(ExpenseClaimSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  summary: z.object({
    pending: z.number(),
    approved: z.number(),
    rejected: z.number(),
    reimbursed: z.number(),
    pendingAmount: z.number(),
  }),
})
```

---

## API Functions (`expenses.api.ts`)

```ts
getExpenseClaims(params?: {
  search?: string
  status?: ExpenseStatus
  category?: ExpenseCategory
  departmentId?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}): Promise<ExpenseListResponse>
  GET /api/expenses

getMyExpenseClaims(params?: {
  status?: ExpenseStatus
  page?: number
  perPage?: number
}): Promise<ExpenseListResponse>
  GET /api/expenses/me

getExpenseClaim(id: string): Promise<ExpenseClaim>
  GET /api/expenses/:id

submitExpenseClaim(employeeId: string, data: SubmitExpenseFormInput): Promise<ExpenseClaim>
  POST /api/expenses

approveExpenseClaim(id: string, reviewer: { id: string; name: string }): Promise<ExpenseClaim>
  PATCH /api/expenses/:id/approve

rejectExpenseClaim(id: string, reviewer: { id: string; name: string }, reason: string): Promise<ExpenseClaim>
  PATCH /api/expenses/:id/reject

markExpenseReimbursed(id: string, reviewer: { id: string; name: string }): Promise<ExpenseClaim>
  PATCH /api/expenses/:id/reimburse
```

**Mock data notes:**
- Seed 15–20 claims across employees with mixed statuses and categories.
- `claimNumber` auto-generated as `EXP-XXXX` sequential.
- Receipt upload returns mock URL `#` or placeholder asset path.
- `summary.pendingAmount` = sum of `amount` where status is `pending`.

---

## UI Notes

Follow patterns in `ui-context.md`:
- Admin view: data table with summary cards row (Pending / Approved / Reimbursed / Total Pending $).
- Employee view: table or card list of own claims + `[+ Submit Expense]` button.
- Amounts formatted with `formatCurrency()`.
- Receipt link opens mock URL in new tab ("View Receipt").

---

## 1. Admin View UI

### Summary Cards (4)
| Pending | Approved | Reimbursed | Pending Amount |
- Pending Amount uses `formatCurrency(summary.pendingAmount)`

### Filter Bar
- Search (title, claim number, employee name)
- Status dropdown
- Category dropdown
- Department dropdown
- Date range (from / to)

### Table Columns
| # | Employee | Title | Category | Amount | Date | Submitted | Status | Actions |

- `#`: claim number (mono)
- Actions: View, Approve (pending), Reject (pending), Mark Reimbursed (approved)

### Expense Detail Modal (`ExpenseDetailModal`)
- Full claim details, receipt link, status history
- Admin actions inline if applicable

### Reject Modal (`RejectExpenseModal`)
- Reason textarea (required, min 5 chars)

---

## 2. Employee View UI

### Page Header (via parent `ExpensesPage`)
- Title: "My Expenses"
- Right: `[+ Submit Expense]`

### Status Tabs
All | Pending | Approved | Rejected | Reimbursed

### Table Columns
| # | Title | Category | Amount | Expense Date | Submitted | Status | Actions |
- Actions: View only; Cancel not in v1

### Submit Expense Modal (`SubmitExpenseModal`)
Fields:
- Title (required)
- Category (select)
- Amount (number, required)
- Expense Date (date, required, not future)
- Description (textarea, optional)
- Receipt upload (optional, `image/*` or PDF)

---

## Status Badges (`ExpenseStatusBadge`)

```ts
const statusConfig = {
  pending:    { label: 'Pending',    className: 'bg-warning-bg text-warning' },
  approved:   { label: 'Approved',   className: 'bg-success-bg text-success' },
  rejected:   { label: 'Rejected',   className: 'bg-error-bg text-error' },
  reimbursed: { label: 'Reimbursed', className: 'bg-info-bg text-info' },
}
```

---

## ViewModel Hooks

### `useExpensesPageViewModel`
```ts
returns { isAdmin: boolean }
```

### `useAdminExpensesViewModel`
```ts
returns {
  claims: ExpenseClaim[]
  summary: ExpenseListResponse['summary']
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: ExpenseStatus | ''
  setStatusFilter: (s: ExpenseStatus | '') => void
  categoryFilter: ExpenseCategory | ''
  setCategoryFilter: (c: ExpenseCategory | '') => void
  departmentFilter: string
  setDepartmentFilter: (id: string) => void
  departments: Department[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  detailClaim: ExpenseClaim | null
  rejectingClaim: ExpenseClaim | null
  openDetail: (claim: ExpenseClaim) => void
  openReject: (claim: ExpenseClaim) => void
  closeModal: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  onMarkReimbursed: (id: string) => void
  isSubmitting: boolean
}
```

### `useEmployeeExpensesViewModel`
```ts
returns {
  claims: ExpenseClaim[]
  isLoading: boolean
  statusFilter: ExpenseStatus | ''
  setStatusFilter: (s: ExpenseStatus | '') => void
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  isSubmitModalOpen: boolean
  openSubmitModal: () => void
  closeSubmitModal: () => void
  onSubmit: (data: SubmitExpenseFormInput) => void
  isSubmitting: boolean
  detailClaim: ExpenseClaim | null
  openDetail: (claim: ExpenseClaim) => void
  closeDetail: () => void
}
```

---

## Expense Report Integration (Spec 12)

After implementation, update `reports.api.ts`:
- `getReportTypes()`: expense → `available: true`
- `generateReport` type `expense` columns:

| Employee | Department | Claim # | Category | Title | Amount | Expense Date | Status | Submitted |

Filters: month/year (on `submittedDate`), department, status.

---

## Workflow Rules

| Current Status | Allowed Admin Actions        |
| -------------- | ---------------------------- |
| pending        | Approve, Reject              |
| approved       | Mark Reimbursed              |
| rejected       | None                         |
| reimbursed     | None                         |

Employees can only submit new claims (status starts as `pending`).

---

## Acceptance Criteria

1. Employee can submit an expense claim via modal with validation.
2. Employee sees only their own claims with status tabs and pagination.
3. Admin sees all claims with summary cards and full filters.
4. Admin can approve, reject (with reason), and mark approved claims as reimbursed.
5. Status badges reflect correct colours per state.
6. Expense detail modal shows receipt link when uploaded.
7. Amounts display formatted currency; pending amount summary is correct.
8. Expense Report in `/reports` becomes available and returns data from expenses store.
9. Loading skeletons and empty states render appropriately.
10. `npm run build` passes with zero TypeScript errors after implementation.
