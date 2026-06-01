# Spec 17 — Bank Accounts & Payment Destinations

## Goal

Build bank account management for payroll payouts. HR Admins create and maintain
employee payment destinations; employees view their own accounts and submit change
requests. Replaces the minimal `bankAccountLast4` field on salary records (Spec 09)
as the source of truth for payout display on payslips and payment reports.

**Implementation note:** Implement in order: (1) types + API + seed data, (2) admin
list/CRUD, (3) employee self-service view, (4) wire payslip/salary UI to primary
account. Follow the Leaves/Expenses role-split pattern where applicable.

**Architecture decision:** v1 stores masked account numbers only (`****1234`) in the
mock store — never full account numbers in localStorage. Routing numbers stored in
full for admin mock display (real app would encrypt). One employee may have
multiple accounts; exactly one may be marked primary for salary deposit.

---

## Routes

| Path                      | Page                 | Role                              |
| ------------------------- | -------------------- | --------------------------------- |
| `/payroll/bank-accounts`  | `BankAccountsPage`   | hr_admin, super_admin, employee   |

`BankAccountsPage` renders `<AdminBankAccountsView>` or `<EmployeeBankAccountsView>`
based on role (same pattern as `ExpensesPage`).

Optional deep-link from Employee Detail (admin): `?employeeId=emp-1` pre-filters admin view.

---

## File Structure

```
src/
├── pages/
│   └── Payroll/
│       ├── BankAccountsPage.tsx
│       ├── BankAccountsPage.viewmodel.ts
│       └── components/
│           ├── AdminBankAccountsView.tsx
│           ├── AdminBankAccountsView.viewmodel.ts
│           ├── EmployeeBankAccountsView.tsx
│           ├── EmployeeBankAccountsView.viewmodel.ts
│           ├── BankAccountTableRow.tsx
│           ├── BankAccountCard.tsx
│           ├── BankAccountFormModal.tsx
│           ├── SetPrimaryAccountModal.tsx
│           ├── BankAccountStatusBadge.tsx
│           └── DeleteBankAccountModal.tsx
├── api/
│   └── bank-accounts.api.ts
└── types/
    └── bank-account.types.ts
```

Update:
- `src/api/payroll.api.ts` — payslip preview reads primary account mask from bank store
- `src/pages/Payroll/components/SalaryFormModal.tsx` — remove standalone `bankAccountLast4`
  field; show read-only link to primary bank account or prompt to add one
- `src/config/navigation.config.ts` — add "Bank Accounts" under PAYROLL section
- `src/types/permission.types.ts` — add module `bank_accounts` (Spec 19 wires UI guards)

---

## Zod Schemas & Types (`bank-account.types.ts`)

```ts
export type BankAccountType = 'checking' | 'savings'
export type BankAccountStatus = 'active' | 'inactive' | 'pending_verification'

export const BankAccountSchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  accountHolderName: z.string(),
  bankName: z.string(),
  accountType: z.enum(['checking', 'savings']),
  accountNumberMasked: z.string(),     // "****4821"
  routingNumber: z.string(),           // mock only; 9 digits US
  isPrimary: z.boolean(),
  status: z.enum(['active', 'inactive', 'pending_verification']),
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const BankAccountFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountType: z.enum(['checking', 'savings']),
  accountNumber: z.string().min(4, 'Account number must be at least 4 digits'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  isPrimary: z.boolean().default(false),
})

export const BankAccountListResponseSchema = z.object({
  data: z.array(BankAccountSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
```

**Masking rule:** API stores `accountNumberMasked` as `****` + last 4 digits on create/update.
Full number never returned in API responses.

---

## API Functions (`bank-accounts.api.ts`)

```ts
getBankAccounts(params?: {
  search?: string
  employeeId?: string
  departmentId?: string
  status?: BankAccountStatus
  page?: number
  perPage?: number
}): Promise<BankAccountListResponse>
  GET /api/payroll/bank-accounts

getMyBankAccounts(employeeId: string): Promise<BankAccount[]>
  GET /api/payroll/bank-accounts/me

getBankAccount(id: string): Promise<BankAccount>
  GET /api/payroll/bank-accounts/:id

getPrimaryBankAccount(employeeId: string): Promise<BankAccount | null>
  GET /api/payroll/bank-accounts/primary/:employeeId

createBankAccount(data: BankAccountFormInput): Promise<BankAccount>
  POST /api/payroll/bank-accounts

updateBankAccount(id: string, data: Partial<BankAccountFormInput>): Promise<BankAccount>
  PUT /api/payroll/bank-accounts/:id

setPrimaryBankAccount(id: string): Promise<BankAccount>
  PATCH /api/payroll/bank-accounts/:id/set-primary

deactivateBankAccount(id: string): Promise<BankAccount>
  PATCH /api/payroll/bank-accounts/:id/deactivate

deleteBankAccount(id: string): Promise<void>
  DELETE /api/payroll/bank-accounts/:id
```

**Mock data notes:**
- Seed 1–2 accounts for 8–10 employees; Jane Employee (`usr-employee-1`) has primary checking account.
- Employee-submitted accounts start as `pending_verification`; admin-created accounts are `active`.
- Deactivating primary account auto-promotes next active account or clears primary flag.
- Cannot delete the only active account if employee has active salary record (guard).

---

## UI Notes

Follow patterns in `ui-context.md`:
- Admin: data table with employee search, department filter, status filter.
- Employee: card list of own accounts + `[+ Add Bank Account]` button.
- Primary account shown with accent badge / star icon.
- Account numbers always displayed masked.

---

## 1. Admin View UI

### Page Header
- Title: "Bank Accounts"
- Breadcrumbs: `[Payroll] → [Bank Accounts]`
- Right: `[+ Add Bank Account]` button

### Filter Bar
- Search (employee name, bank name, masked account)
- Department dropdown
- Status dropdown (All / Active / Inactive / Pending Verification)

### Table Columns
| Employee | Bank | Account Holder | Type | Account # | Routing | Primary | Status | Actions |

- Actions: Edit, Set Primary (if not primary), Deactivate, Delete (with guards)

### Add / Edit Bank Account Modal (`BankAccountFormModal`)
Fields:
- Employee (searchable select — admin only; pre-filled on employee self-service)
- Account Holder Name
- Bank Name
- Account Type (Checking / Savings)
- Account Number (password-style input on edit — leave blank to keep existing)
- Routing Number (9 digits)
- Set as primary (checkbox)

### Delete Guard
- Block delete if only account for employee with active salary and account is primary.

---

## 2. Employee View UI

### Page Header (via parent)
- Title: "My Bank Accounts"
- Right: `[+ Add Bank Account]`

### Account Cards (`BankAccountCard`)
Each card shows:
- Bank name + account type
- Masked account number
- Primary badge (if applicable)
- Status badge
- `[Set as Primary]` (non-primary, active only)
- View-only for inactive accounts

Employee-created accounts show **Pending Verification** until admin approves (future:
approve action in admin row menu — v1: admin edits status to active).

---

## 3. Payslip & Salary Integration

### PayslipPreview
- Add row: **Deposit Account** — `{bankName} {accountType} ****1234` or "Not configured"

### SalaryFormModal
- Remove editable `bankAccountLast4` field.
- Show info panel: "Primary payout account: [link to bank accounts]" or warning if none.

### Payment Report (Spec 12)
- Optional column: `Deposit Account` (masked) — add when generating payment report rows.

---

## ViewModel Hooks

### `useBankAccountsPageViewModel`
```ts
returns { isAdmin: boolean }
```

### `useAdminBankAccountsViewModel`
```ts
returns {
  accounts: BankAccount[]
  isLoading: boolean
  searchQuery, setSearchQuery
  departmentFilter, setDepartmentFilter
  statusFilter, setStatusFilter
  departments
  page, totalPages, onPageChange
  selectedAccount, modalMode: 'add' | 'edit' | 'delete' | 'setPrimary' | null
  openAddModal, openEditModal, openDeleteModal, closeModal
  onSubmit, onDelete, onSetPrimary, onDeactivate
  isSubmitting
}
```

### `useEmployeeBankAccountsViewModel`
```ts
returns {
  accounts: BankAccount[]
  isLoading: boolean
  isFormModalOpen, openFormModal, closeFormModal
  onSubmit, onSetPrimary
  isSubmitting
}
```

---

## Route Guards & Nav

- Route `/payroll/bank-accounts` → all authenticated roles (employee sees own only via API).
- Nav: add under PAYROLL — "Bank Accounts" → `/payroll/bank-accounts`
  - Roles: `super_admin`, `hr_admin`, `employee`

---

## Acceptance Criteria

1. Admin sees paginated bank accounts with search and filters.
2. Admin can add/edit/deactivate/delete accounts for any employee.
3. Employee sees only their own accounts.
4. Employee can add a new account (status `pending_verification`).
5. Exactly one primary account per employee; Set Primary works correctly.
6. Account numbers displayed masked everywhere; full numbers never in API responses.
7. Payslip preview shows primary deposit account or "Not configured".
8. Salary form no longer uses standalone `bankAccountLast4` input.
9. Delete/deactivate guards enforced for sole primary account edge cases.
10. `npm run build` passes with zero TypeScript errors after implementation.
