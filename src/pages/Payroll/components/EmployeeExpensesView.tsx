import { Plus } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import type { ExpenseStatus } from '../../../types/expense.types'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { CancelExpenseModal } from './CancelExpenseModal'
import { ExpenseClaimTableRow } from './ExpenseClaimTableRow'
import { ExpenseDetailModal } from './ExpenseDetailModal'
import { SubmitExpenseModal } from './SubmitExpenseModal'
import { useEmployeeExpensesViewModel } from './EmployeeExpensesView.viewmodel'

const STATUS_TABS: Array<{ value: ExpenseStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EmployeeExpensesView() {
  const vm = useEmployeeExpensesViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <PermissionGate module="expenses" action="create">
          <Button onClick={vm.openSubmitModal}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Expense
          </Button>
        </PermissionGate>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => vm.setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              vm.statusFilter === tab.value
                ? 'border-b-2 border-accent text-accent'
                : 'text-secondary hover:text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Expense Date</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.claims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-secondary">
                      No expense claims found. Submit your first claim to get started.
                    </td>
                  </tr>
                ) : (
                  vm.claims.map((claim) => (
                    <ExpenseClaimTableRow
                      key={claim.id}
                      claim={claim}
                      variant="employee"
                      onView={vm.openDetail}
                      onCancel={vm.openCancelModal}
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

      <SubmitExpenseModal
        isOpen={vm.isSubmitModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeSubmitModal}
        onSubmit={vm.onSubmit}
      />

      <ExpenseDetailModal
        claim={vm.detailClaim}
        isOpen={Boolean(vm.detailClaim)}
        onClose={vm.closeDetail}
      />

      <CancelExpenseModal
        claim={vm.cancelClaim}
        isOpen={Boolean(vm.cancelClaim)}
        isSubmitting={vm.isCancelling}
        onClose={vm.closeCancelModal}
        onConfirm={vm.onConfirmCancel}
      />
    </>
  )
}
