import { PageHeader } from '../../components/layout/PageHeader'
import { AdminPayslipView } from './components/AdminPayslipView'
import { EmployeePayslipView } from './components/EmployeePayslipView'
import { usePayslipPageViewModel } from './PayslipPage.viewmodel'

export function PayslipPage() {
  const { isAdmin } = usePayslipPageViewModel()

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Payslips' : 'My Payslips'}
        breadcrumbs={[{ label: 'Payroll' }, { label: 'Payslip' }]}
      />
      {isAdmin ? <AdminPayslipView /> : <EmployeePayslipView />}
    </>
  )
}
