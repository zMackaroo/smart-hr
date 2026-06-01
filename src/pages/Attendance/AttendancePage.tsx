import { PageHeader } from '../../components/layout/PageHeader'
import { AdminAttendanceView } from './components/AdminAttendanceView'
import { EmployeeAttendanceView } from './components/EmployeeAttendanceView'
import { useAttendancePageViewModel } from './AttendancePage.viewmodel'

export function AttendancePage() {
  const { isAdmin } = useAttendancePageViewModel()

  return (
    <>
      <PageHeader
        title="Attendance"
        breadcrumbs={[{ label: 'HR' }, { label: 'Attendance' }]}
      />
      {isAdmin ? <AdminAttendanceView /> : <EmployeeAttendanceView />}
    </>
  )
}
