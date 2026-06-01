import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { UserAvatar } from '../../components/layout/UserAvatar'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { formatCurrency } from '../../utils/currency.utils'
import { formatDate } from '../../utils/date.utils'
import { PAY_FREQUENCY_LABELS } from '../../types/payroll.types'
import { SalaryFormModal } from './components/SalaryFormModal'
import { useEmployeeSalaryPageViewModel } from './EmployeeSalaryPage.viewmodel'

export function EmployeeSalaryPage() {
  const vm = useEmployeeSalaryPageViewModel()

  return (
    <>
      <PageHeader
        title="Employee Salary"
        breadcrumbs={[{ label: 'Payroll' }, { label: 'Employee Salary' }]}
        actions={
          <PermissionGate module="payroll" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Salary
            </Button>
          </PermissionGate>
        }
      />

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
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
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
      </div>

      <p className="mb-4 text-sm text-secondary">Showing {vm.salaries.length} of {vm.total} records</p>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.salaries.length === 0 ? (
        <EmptyState
          title="No salary records found"
          action={
            <PermissionGate module="payroll" action="create">
              <Button onClick={vm.openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Salary
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Base Salary</th>
                <th className="px-5 py-3">Gross</th>
                <th className="px-5 py-3">Net Salary</th>
                <th className="px-5 py-3">Pay Frequency</th>
                <th className="px-5 py-3">Effective From</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.salaries.map((salary) => (
                <tr
                  key={salary.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={salary.employee.name}
                        avatarUrl={salary.employee.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary">{salary.employee.name}</p>
                        <p className="text-xs text-secondary">{salary.employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{salary.employee.department}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-primary">
                    {formatCurrency(salary.baseSalary)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-primary">
                    {formatCurrency(salary.grossSalary)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-primary">
                    {formatCurrency(salary.netSalary)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {PAY_FREQUENCY_LABELS[salary.payFrequency]}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {formatDate(salary.effectiveFrom)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <PermissionGate module="payroll" action="edit">
                        <button
                          type="button"
                          onClick={() => vm.openEditModal(salary)}
                          className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-primary"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </PermissionGate>
                      <PermissionGate module="payroll" action="delete">
                        <button
                          type="button"
                          onClick={() => vm.openDeleteModal(salary)}
                          className="rounded-md p-2 text-secondary hover:bg-surface-alt hover:text-error"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </PermissionGate>
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

      <SalaryFormModal
        isOpen={vm.isFormModalOpen}
        salary={vm.selectedSalary}
        availableEmployees={vm.availableEmployees}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        isOpen={vm.isDeleteModalOpen}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
        title="Delete Salary"
        message={
          vm.selectedSalary
            ? `Delete salary configuration for ${vm.selectedSalary.employee.name}?`
            : ''
        }
        confirmLabel="Delete"
        isLoading={vm.isSubmitting}
        destructive
      />
    </>
  )
}
