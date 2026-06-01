import { Plus } from 'lucide-react'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { cn } from '../../../utils/cn'
import { formatDate } from '../../../utils/date.utils'
import type { LeaveStatus } from '../../../types/leave.types'
import { ApplyLeaveModal } from './ApplyLeaveModal'
import { LeaveBalanceCard } from './LeaveBalanceCard'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { useEmployeeLeavesViewModel } from './EmployeeLeavesView.viewmodel'

const STATUS_TABS: Array<{ value: LeaveStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function EmployeeLeavesView() {
  const vm = useEmployeeLeavesViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={vm.openApplyModal}>
          <Plus className="mr-2 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      {vm.isLoading ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vm.balances.map((balance) => (
            <LeaveBalanceCard key={balance.leaveTypeId} balance={balance} />
          ))}
        </div>
      )}

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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">To</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Applied On</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-secondary">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                vm.leaveRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                  >
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-2 text-sm text-primary">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: request.leaveType.color }}
                        />
                        {request.leaveType.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {formatDate(request.fromDate)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {formatDate(request.toDate)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-secondary">{request.days}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {formatDate(request.appliedOn)}
                    </td>
                    <td className="px-5 py-3.5">
                      <LeaveStatusBadge status={request.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => vm.openCancelConfirm(request.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ApplyLeaveModal
        isOpen={vm.isApplyModalOpen}
        leaveTypes={vm.leaveTypes}
        balances={vm.balances}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeApplyModal}
        onSubmit={vm.onSubmitApply}
      />

      <ConfirmDialog
        isOpen={Boolean(vm.cancellingId)}
        onClose={vm.closeCancelConfirm}
        onConfirm={vm.onConfirmCancel}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave request?"
        confirmLabel="Cancel Request"
        isLoading={vm.isCancelling}
        destructive
      />
    </>
  )
}
