import { PageHeader } from '../../components/layout/PageHeader'
import { AdminDashboard } from './components/AdminDashboard'
import { EmployeeDashboard } from './components/EmployeeDashboard'
import { useDashboardPageViewModel } from './DashboardPage.viewmodel'

export function DashboardPage() {
  const { isAdmin } = useDashboardPageViewModel()

  return (
    <>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Main' }, { label: 'Dashboard' }]} />
      {isAdmin ? <AdminDashboard /> : <EmployeeDashboard />}
    </>
  )
}
