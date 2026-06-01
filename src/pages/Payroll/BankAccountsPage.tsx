import { PageHeader } from '../../components/layout/PageHeader'
import { AdminBankAccountsView } from './components/AdminBankAccountsView'
import { EmployeeBankAccountsView } from './components/EmployeeBankAccountsView'
import { useBankAccountsPageViewModel } from './BankAccountsPage.viewmodel'

export function BankAccountsPage() {
  const { isAdmin } = useBankAccountsPageViewModel()

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Bank Accounts' : 'My Bank Accounts'}
        breadcrumbs={[{ label: 'Payroll' }, { label: 'Bank Accounts' }]}
      />
      {isAdmin ? <AdminBankAccountsView /> : <EmployeeBankAccountsView />}
    </>
  )
}
