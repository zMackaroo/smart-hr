import { Search } from 'lucide-react'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { UserAvatar } from '../../components/layout/UserAvatar'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { formatCurrency } from '../../utils/currency.utils'
import type { PfContributionStatus } from '../../types/payroll.types'
import { ProvidentFundSettingsModal } from './components/ProvidentFundSettingsModal'
import { ProvidentFundSummaryCards } from './components/ProvidentFundSummaryCards'
import { useProvidentFundPageViewModel } from './ProvidentFundPage.viewmodel'

const STATUS_OPTIONS: Array<{ value: PfContributionStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
]

export function ProvidentFundPage() {
  const vm = useProvidentFundPageViewModel()

  return (
    <>
      <PageHeader
        title="Provident Fund"
        breadcrumbs={[{ label: 'Payroll' }, { label: 'Provident Fund' }]}
        actions={
          <Button variant="outline" onClick={vm.openSettingsModal}>
            PF Settings
          </Button>
        }
      />

      <ProvidentFundSummaryCards summary={vm.summary} isLoading={vm.isLoading} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={vm.selectedDepartment}
          onChange={(e) => vm.setSelectedDepartment(e.target.value)}
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
          value={vm.selectedStatus}
          onChange={(e) => vm.setSelectedStatus(e.target.value as PfContributionStatus | '')}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
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
      ) : vm.records.length === 0 ? (
        <EmptyState title="No PF records found" description="Configure employee salaries to enroll employees in PF." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Emp. Rate</th>
                <th className="px-5 py-3">Empl. Rate</th>
                <th className="px-5 py-3">Emp. Contribution</th>
                <th className="px-5 py-3">Empl. Contribution</th>
                <th className="px-5 py-3">Total Balance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={record.employee.name}
                        avatarUrl={record.employee.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary">{record.employee.name}</p>
                        <p className="text-xs text-secondary">{record.employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.employeeContributionRate}%
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.employerContributionRate}%
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-primary">
                    {formatCurrency(record.employeeContributionAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-primary">
                    {formatCurrency(record.employerContributionAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-primary">
                    {formatCurrency(record.totalBalance)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={
                        record.status === 'active'
                          ? 'active'
                          : record.status === 'paused'
                            ? 'pending'
                            : 'inactive'
                      }
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    {record.status !== 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={vm.togglingId === record.id}
                        onClick={() => vm.onToggleStatus(record.id)}
                      >
                        {record.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    )}
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

      <ProvidentFundSettingsModal
        isOpen={vm.isSettingsModalOpen}
        settings={vm.pfSettings}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeSettingsModal}
        onSubmit={vm.onSaveSettings}
      />

      <ConfirmDialog
        isOpen={Boolean(vm.confirmToggleId)}
        onClose={vm.closeToggleConfirm}
        onConfirm={vm.onConfirmToggle}
        title="Update PF Status"
        message="Are you sure you want to change this employee's PF contribution status?"
        confirmLabel="Confirm"
        isLoading={vm.isSubmitting}
      />
    </>
  )
}
