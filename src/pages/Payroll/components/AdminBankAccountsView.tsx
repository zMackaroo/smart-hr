import { Plus } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Button } from '../../../components/ui/Button'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { BankAccountStatus } from '../../../types/bank-account.types'
import { ACCOUNT_STATUS_LABELS } from '../../../types/bank-account.types'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { BankAccountFormModal } from './BankAccountFormModal'
import { BankAccountTableRow } from './BankAccountTableRow'
import { DeleteBankAccountModal } from './DeleteBankAccountModal'
import { SetPrimaryAccountModal } from './SetPrimaryAccountModal'
import { useAdminBankAccountsViewModel } from './AdminBankAccountsView.viewmodel'

const STATUS_OPTIONS: Array<{ value: BankAccountStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => ({
    value: value as BankAccountStatus,
    label,
  })),
]

const selectClassName =
  'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

interface AdminBankAccountsViewProps {
  onAddClick?: () => void
}

export function AdminBankAccountsView({ onAddClick }: AdminBankAccountsViewProps) {
  const vm = useAdminBankAccountsViewModel()

  const handleAdd = () => {
    if (onAddClick) onAddClick()
    vm.openAddModal()
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <PermissionGate module="bank_accounts" action="create">
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Button>
        </PermissionGate>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={vm.searchQuery}
          onChange={(event) => vm.setSearchQuery(event.target.value)}
          placeholder="Search employee, bank, account..."
          className={selectClassName + ' w-full xl:col-span-2'}
        />
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
        <select
          value={vm.statusFilter}
          onChange={(event) => vm.setStatusFilter(event.target.value as BankAccountStatus | '')}
          className={selectClassName}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {vm.employeeFilter && (
          <select
            value={vm.employeeFilter}
            onChange={() => undefined}
            disabled
            className={selectClassName + ' xl:col-span-2'}
          >
            <option value={vm.employeeFilter}>
              Filtered:{' '}
              {vm.employees.find((employee) => employee.id === vm.employeeFilter)?.fullName ??
                vm.employeeFilter}
            </option>
          </select>
        )}
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
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Bank</th>
                  <th className="px-5 py-3">Account Holder</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Account #</th>
                  <th className="px-5 py-3">Routing</th>
                  <th className="px-5 py-3">Primary</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.accounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10 text-center text-sm text-secondary">
                      No bank accounts found.
                    </td>
                  </tr>
                ) : (
                  vm.accounts.map((account) => (
                    <BankAccountTableRow
                      key={account.id}
                      account={account}
                      onEdit={vm.openEditModal}
                      onSetPrimary={vm.openSetPrimaryModal}
                      onDeactivate={vm.openDeactivateModal}
                      onDelete={vm.openDeleteModal}
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

      <BankAccountFormModal
        isOpen={vm.isFormModalOpen}
        account={vm.selectedAccount}
        employees={vm.employees}
        isAdmin
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <DeleteBankAccountModal
        account={vm.selectedAccount}
        isOpen={vm.isDeleteModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onDelete}
      />

      <SetPrimaryAccountModal
        account={vm.selectedAccount}
        isOpen={vm.isSetPrimaryModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onSetPrimary}
      />

      <ConfirmDialog
        isOpen={vm.modalMode === 'deactivate'}
        onClose={vm.closeModal}
        onConfirm={vm.onDeactivate}
        title="Deactivate bank account?"
        message={
          vm.selectedAccount
            ? `Deactivate ${vm.selectedAccount.bankName} account ${vm.selectedAccount.accountNumberMasked} for ${vm.selectedAccount.employee.name}?`
            : ''
        }
        confirmLabel="Deactivate"
        destructive
        isLoading={vm.isSubmitting}
      />
    </>
  )
}
