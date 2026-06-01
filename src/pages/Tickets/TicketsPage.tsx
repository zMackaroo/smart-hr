import { PageHeader } from '../../components/layout/PageHeader'
import { AdminTicketsView } from './components/AdminTicketsView'
import { EmployeeTicketsView } from './components/EmployeeTicketsView'
import { useTicketsPageViewModel } from './TicketsPage.viewmodel'

export function TicketsPage() {
  const { isAdmin } = useTicketsPageViewModel()

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Tickets' : 'My Tickets'}
        breadcrumbs={[{ label: 'Support' }, { label: isAdmin ? 'Tickets' : 'My Tickets' }]}
      />
      {isAdmin ? <AdminTicketsView /> : <EmployeeTicketsView />}
    </>
  )
}
