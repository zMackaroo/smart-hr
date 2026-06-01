import { EXPENSE_CATEGORIES, CATEGORY_LABELS, type ExpenseCategory, type ExpenseStatus } from '../../../types/expense.types'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { ExpenseClaimTableRow } from './ExpenseClaimTableRow'
import { ExpenseDetailModal } from './ExpenseDetailModal'
import { ExpenseSummaryCards } from './ExpenseSummaryCards'
import { RejectExpenseModal } from './RejectExpenseModal'
import { useAdminExpensesViewModel } from './AdminExpensesView.viewmodel'

const STATUS_OPTIONS: Array<{ value: ExpenseStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const selectClassName =
  'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

export function AdminExpensesView() {
  const vm = useAdminExpensesViewModel()

  return (
    <>
      <ExpenseSummaryCards summary={vm.summary} isLoading={vm.isLoading} />

      <div className="mb-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <input
          type="search"
          value={vm.searchQuery}
          onChange={(event) => vm.setSearchQuery(event.target.value)}
          placeholder="Search title, claim #, employee..."
          className={selectClassName + ' w-full xl:col-span-2'}
        />
        <select
          value={vm.statusFilter}
          onChange={(event) => vm.setStatusFilter(event.target.value as ExpenseStatus | '')}
          className={selectClassName}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={vm.categoryFilter}
          onChange={(event) => vm.setCategoryFilter(event.target.value as ExpenseCategory | '')}
          className={selectClassName}
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <select
          value={vm.departmentFilter}
          onChange={(event) => vm.setDepartmentFilter(event.target.value)}
          className={selectClassName}
        >
          <option value="">All Departments</option>
          {vm.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <InputDate
          label="From"
          value={vm.dateFrom}
          onChange={vm.setDateFrom}
        />
        <InputDate
          label="To"
          value={vm.dateTo}
          onChange={vm.setDateTo}
        />
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.claims.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-sm text-secondary">
                      No expense claims found.
                    </td>
                  </tr>
                ) : (
                  vm.claims.map((claim) => (
                    <ExpenseClaimTableRow
                      key={claim.id}
                      claim={claim}
                      variant="admin"
                      onView={vm.openDetail}
                      onApprove={vm.onApprove}
                      onReject={vm.openReject}
                      onMarkReimbursed={vm.onMarkReimbursed}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EmployeePagination
        page={vm.page}
        totalPages={vm.totalPages}
        start={vm.start}
        end={vm.end}
        total={vm.total}
        onPageChange={vm.onPageChange}
      />

      <ExpenseDetailModal
        claim={vm.detailClaim}
        isOpen={Boolean(vm.detailClaim)}
        isAdmin
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onApprove={vm.onApprove}
        onReject={vm.openReject}
        onMarkReimbursed={vm.onMarkReimbursed}
      />

      <RejectExpenseModal
        claim={vm.rejectingClaim}
        isOpen={Boolean(vm.rejectingClaim)}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={(reason) => {
          if (vm.rejectingClaim) {
            vm.onReject(vm.rejectingClaim.id, reason)
          }
        }}
      />
    </>
  )
}

function InputDate({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-secondary">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  )
}
