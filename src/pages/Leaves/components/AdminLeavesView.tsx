import { Check, Eye, Pencil, Plus, Trash2, X } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { formatDate } from '../../../utils/date.utils'
import { cn } from '../../../utils/cn'
import type { LeaveStatus } from '../../../types/leave.types'
import { LeaveDetailModal } from './LeaveDetailModal'
import { LeaveStatusBadge } from './LeaveStatusBadge'
import { LeaveTypeFormModal } from './LeaveTypeFormModal'
import { RejectLeaveModal } from './RejectLeaveModal'
import { useAdminLeavesViewModel } from './AdminLeavesView.viewmodel'

const STATUS_OPTIONS: Array<{ value: LeaveStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const MONTHS = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function AdminLeavesView() {
  const vm = useAdminLeavesViewModel()

  return (
    <>
      <div className="mb-6 flex gap-1 border-b border-border">
        {(['requests', 'types'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => vm.setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              vm.activeTab === tab
                ? 'border-b-2 border-accent text-accent'
                : 'text-secondary hover:text-primary',
            )}
          >
            {tab === 'requests' ? 'Leave Requests' : 'Leave Types'}
          </button>
        ))}
      </div>

      {vm.activeTab === 'requests' ? (
        <>
          <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
            <select
              value={vm.statusFilter}
              onChange={(e) => vm.setStatusFilter(e.target.value as LeaveStatus | '')}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={vm.departmentFilter}
              onChange={(e) => vm.setDepartmentFilter(e.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">All Departments</option>
              {vm.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={vm.leaveTypeFilter}
              onChange={(e) => vm.setLeaveTypeFilter(e.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">All Leave Types</option>
              {vm.leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
            <select
              value={vm.selectedMonth === '' ? '' : vm.selectedMonth}
              onChange={(e) =>
                vm.setSelectedMonth(e.target.value ? Number(e.target.value) : '')
              }
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={index === 0 ? '' : index}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={vm.selectedYear}
              onChange={(e) => vm.setSelectedYear(Number(e.target.value))}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {vm.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                    <th className="px-5 py-3">Employee</th>
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
                  {vm.leaveRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={request.employee.name}
                            avatarUrl={request.employee.avatarUrl}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {request.employee.name}
                            </p>
                            <p className="text-xs text-secondary">{request.employee.department}</p>
                          </div>
                        </div>
                      </td>
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
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => vm.openDetailModal(request)}
                            className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-primary"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => vm.openApproveModal(request)}
                                className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-success"
                                aria-label="Approve"
                              >
                                <Check className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                              <button
                                type="button"
                                onClick={() => vm.openRejectModal(request)}
                                className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-error"
                                aria-label="Reject"
                              >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <EmployeePagination
            page={vm.page}
            totalPages={vm.totalPages}
            start={vm.total === 0 ? 0 : (vm.page - 1) * 20 + 1}
            end={Math.min(vm.page * 20, vm.total)}
            total={vm.total}
            onPageChange={vm.onPageChange}
          />
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-end">
            <Button onClick={vm.openAddLeaveTypeModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Leave Type
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Color</th>
                  <th className="px-5 py-3">Days/Year</th>
                  <th className="px-5 py-3">Carry Forward</th>
                  <th className="px-5 py-3">Requires Document</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.leaveTypes.map((lt) => (
                  <tr
                    key={lt.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-primary">{lt.name}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-block h-6 w-6 rounded"
                        style={{ backgroundColor: lt.color }}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-secondary">{lt.defaultDays}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {lt.carryForward ? '✓' : '✗'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {lt.requiresDocument ? '✓' : '✗'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lt.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => vm.openEditLeaveTypeModal(lt)}
                          className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-primary"
                          aria-label={`Edit ${lt.name}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => vm.openDeleteLeaveTypeModal(lt)}
                          className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-error"
                          aria-label={`Delete ${lt.name}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <LeaveDetailModal
        request={vm.detailRequest}
        isOpen={Boolean(vm.detailRequest)}
        onClose={vm.closeDetailModal}
      />

      <ConfirmDialog
        isOpen={Boolean(vm.approvingRequest)}
        onClose={vm.closeApproveModal}
        onConfirm={vm.onConfirmApprove}
        title="Approve Leave"
        message={
          vm.approvingRequest
            ? `Approve ${vm.approvingRequest.employee.name}'s ${vm.approvingRequest.leaveType.name} leave for ${vm.approvingRequest.days} day${vm.approvingRequest.days === 1 ? '' : 's'}?`
            : ''
        }
        confirmLabel="Approve"
        isLoading={vm.isApproving}
      />

      <RejectLeaveModal
        request={vm.rejectingRequest}
        isOpen={Boolean(vm.rejectingRequest)}
        isSubmitting={vm.isRejecting}
        onClose={vm.closeRejectModal}
        onConfirm={vm.onConfirmReject}
      />

      <LeaveTypeFormModal
        isOpen={vm.isLeaveTypeFormOpen}
        leaveType={vm.selectedLeaveType}
        isSubmitting={vm.isSubmittingLeaveType}
        onClose={vm.closeLeaveTypeModal}
        onSubmit={vm.onSubmitLeaveType}
      />

      <Modal
        isOpen={vm.isDeleteLeaveTypeOpen}
        onClose={vm.closeLeaveTypeModal}
        title="Delete Leave Type"
        footer={
          <>
            <Button variant="outline" onClick={vm.closeLeaveTypeModal} disabled={vm.isSubmittingLeaveType}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={vm.onConfirmDeleteLeaveType}
              disabled={vm.isSubmittingLeaveType || !vm.canDeleteLeaveType}
            >
              Delete
            </Button>
          </>
        }
      >
        {vm.selectedLeaveType && (
          <div className="space-y-3">
            {!vm.canDeleteLeaveType ? (
              <div className="flex gap-3 rounded-md border border-warning/30 bg-warning/10 p-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm text-primary">
                  &quot;{vm.selectedLeaveType.name}&quot; has active leave requests. Resolve them
                  before deleting.
                </p>
              </div>
            ) : (
              <p className="text-sm text-secondary">
                Are you sure you want to delete &quot;{vm.selectedLeaveType.name}&quot;?
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
