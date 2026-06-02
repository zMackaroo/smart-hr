import { Search } from 'lucide-react'
import { EXPENSE_CATEGORIES, CATEGORY_LABELS, type ExpenseCategory, type ExpenseStatus } from '../../../types/expense.types'
import { Select, selectTriggerClassName } from '../../../components/ui/Select'
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

export function AdminExpensesView() {
  const vm = useAdminExpensesViewModel()

  return (
    <>
      <ExpenseSummaryCards summary={vm.summary} isLoading={vm.isLoading} />

      <div className="mb-4 rounded-lg border border-border/70 bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
          <div className="sm:col-span-2 xl:col-span-4">
            <label htmlFor="expense-search" className="mb-1 block text-sm font-medium text-primary">
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                strokeWidth={1.5}
              />
              <input
                id="expense-search"
                type="search"
                value={vm.searchQuery}
                onChange={(event) => vm.setSearchQuery(event.target.value)}
                placeholder="Title, claim #, employee..."
                className={selectTriggerClassName + ' pl-9'}
              />
            </div>
          </div>

          <Select
            label="Status"
            value={vm.statusFilter}
            onChange={(value) => vm.setStatusFilter(value as ExpenseStatus | '')}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            searchable={false}
            className="xl:col-span-2"
          />

          <Select
            label="Category"
            value={vm.categoryFilter}
            onChange={(value) => vm.setCategoryFilter(value as ExpenseCategory | '')}
            placeholder="All Categories"
            searchable={false}
            options={[
              { value: '', label: 'All Categories' },
              ...EXPENSE_CATEGORIES.map((category) => ({
                value: category,
                label: CATEGORY_LABELS[category],
              })),
            ]}
            className="xl:col-span-2"
          />

          <Select
            label="Department"
            value={vm.departmentFilter}
            onChange={vm.setDepartmentFilter}
            placeholder="All Departments"
            options={[
              { value: '', label: 'All Departments' },
              ...vm.departments.map((department) => ({
                value: department.id,
                label: department.name,
              })),
            ]}
            className="xl:col-span-2"
          />

          <InputDate
            label="From"
            value={vm.dateFrom}
            onChange={vm.setDateFrom}
            className="xl:col-span-1"
          />

          <InputDate
            label="To"
            value={vm.dateTo}
            onChange={vm.setDateTo}
            className="xl:col-span-1"
          />
        </div>
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
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-primary">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectTriggerClassName}
      />
    </div>
  )
}
