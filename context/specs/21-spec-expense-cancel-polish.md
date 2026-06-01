# Spec 21 — Expense Cancel & App Shell Polish

## Goal

Close small v1 gaps deferred in earlier specs: employee cancel for pending expense
claims (Spec 16) and restore the sidebar user footer (Spec 03). Low-scope polish
spec — single session.

---

## 1. Employee Cancel Expense Claim

### API (`expenses.api.ts`)

```ts
cancelExpenseClaim(id: string, employeeId: string): Promise<ExpenseClaim>
  PATCH /api/expenses/:id/cancel
```

**Rules:**
- Only `pending` claims may be cancelled.
- Only the owning employee (matching `employeeId`) may cancel.
- Status transitions: `pending` → `cancelled` (add `cancelled` to `ExpenseStatus` enum).

Update `ExpenseStatus`:
```ts
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'cancelled'
```

Update summary counts: `cancelled` excluded from `pendingAmount`; optional filter tab.

### UI (`EmployeeExpensesView`)
- Pending rows: `[Cancel]` button → confirm dialog
- `ExpenseStatusBadge`: cancelled → default/muted variant
- Admin filters: add "Cancelled" status option

### Acceptance (Expense Cancel)
1. Employee can cancel own pending claim with confirmation.
2. Cannot cancel approved/rejected/reimbursed claims.
3. Admin sees cancelled status in table and filters.

---

## 2. Sidebar User Footer

Restore commented-out user block in `Sidebar.tsx` (Spec 03):
- Avatar, name, role badge at bottom of sidebar
- Visible expanded; avatar-only when collapsed
- Remove unused import lint suppressions

### Acceptance (Sidebar)
1. Logged-in user name and role visible in sidebar footer when expanded.
2. Collapsed sidebar shows avatar only.
3. `npm run build` passes with no unused import errors.

---

## Routes

No new routes.

---

## File Structure

```
src/
├── api/
│   └── expenses.api.ts           ← add cancelExpenseClaim
├── types/
│   └── expense.types.ts          ← add cancelled status
├── pages/Payroll/components/
│   ├── EmployeeExpensesView.tsx
│   ├── EmployeeExpensesView.viewmodel.ts
│   ├── ExpenseStatusBadge.tsx
│   └── CancelExpenseModal.tsx      ← NEW (ConfirmDialog wrapper)
└── components/layout/
    └── Sidebar.tsx                 ← restore user footer
```

---

## Acceptance Criteria

1. All Spec 21 expense cancel criteria met.
2. Sidebar user footer restored per Spec 03.
3. Expense Report includes `cancelled` in status filter options.
4. `npm run build` passes with zero TypeScript errors after implementation.
