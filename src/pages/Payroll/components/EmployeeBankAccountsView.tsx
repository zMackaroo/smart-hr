import { Plus } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Button } from '../../../components/ui/Button'
import { BankAccountCard } from './BankAccountCard'
import { BankAccountFormModal } from './BankAccountFormModal'
import { SetPrimaryAccountModal } from './SetPrimaryAccountModal'
import { useEmployeeBankAccountsViewModel } from './EmployeeBankAccountsView.viewmodel'

export function EmployeeBankAccountsView() {
  const vm = useEmployeeBankAccountsViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <PermissionGate module="bank_accounts" action="create">
          <Button onClick={vm.openFormModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Button>
        </PermissionGate>
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.accounts.length === 0 ? (
        <div className="rounded-lg border border-border/70 bg-surface p-10 text-center shadow-card">
          <p className="text-sm text-secondary">
            No bank accounts on file. Add an account to receive salary deposits.
          </p>
          <PermissionGate module="bank_accounts" action="create">
            <Button className="mt-4" onClick={vm.openFormModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </PermissionGate>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vm.accounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onSetPrimary={vm.onSetPrimary}
            />
          ))}
        </div>
      )}

      <BankAccountFormModal
        isOpen={vm.isFormModalOpen}
        account={null}
        employees={[]}
        employeeId={vm.employeeId}
        isAdmin={false}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeFormModal}
        onSubmit={vm.onSubmit}
      />

      <SetPrimaryAccountModal
        account={vm.primaryAccount}
        isOpen={Boolean(vm.primaryAccount)}
        isSubmitting={vm.isSubmitting}
        onClose={vm.cancelSetPrimary}
        onConfirm={vm.confirmSetPrimary}
      />
    </>
  )
}
