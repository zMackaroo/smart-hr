import { PageHeader } from '../../components/layout/PageHeader'
import { AdminLeavesView } from './components/AdminLeavesView'
import { EmployeeLeavesView } from './components/EmployeeLeavesView'
import { useLeavesPageViewModel } from './LeavesPage.viewmodel'

export function LeavesPage() {
  const { isAdmin } = useLeavesPageViewModel()

  return (
    <>
      <PageHeader
        title="Leaves"
        breadcrumbs={[{ label: 'HR' }, { label: 'Leaves' }]}
      />
      {isAdmin ? <AdminLeavesView /> : <EmployeeLeavesView />}
    </>
  )
}
