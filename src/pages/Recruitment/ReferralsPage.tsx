import { PageHeader } from '../../components/layout/PageHeader'
import { AdminReferralsView } from './components/AdminReferralsView'
import { EmployeeReferralsView } from './components/EmployeeReferralsView'
import { useReferralsPageViewModel } from './ReferralsPage.viewmodel'

export function ReferralsPage() {
  const { isAdmin } = useReferralsPageViewModel()

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Referrals' : 'My Referrals'}
        breadcrumbs={[{ label: 'Recruitment' }, { label: isAdmin ? 'Referrals' : 'My Referrals' }]}
      />
      {isAdmin ? <AdminReferralsView /> : <EmployeeReferralsView />}
    </>
  )
}
