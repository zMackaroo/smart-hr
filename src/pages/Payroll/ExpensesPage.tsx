import { PageHeader } from '../../components/layout/PageHeader'
import { AdminExpensesView } from './components/AdminExpensesView'
import { EmployeeExpensesView } from './components/EmployeeExpensesView'
import { useExpensesPageViewModel } from './ExpensesPage.viewmodel'

export function ExpensesPage() {
  const { isAdmin } = useExpensesPageViewModel()

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Expense Claims' : 'My Expenses'}
        breadcrumbs={[{ label: 'Payroll' }, { label: 'Expenses' }]}
      />
      {isAdmin ? <AdminExpensesView /> : <EmployeeExpensesView />}
    </>
  )
}
