import { MonthYearPicker } from '../../Attendance/components/AttendanceFilters'
import { PayslipCard } from './PayslipCard'
import { PayslipDetailModal } from './PayslipDetailModal'
import { useEmployeePayslipViewModel } from './EmployeePayslipView.viewmodel'

export function EmployeePayslipView() {
  const vm = useEmployeePayslipViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <MonthYearPicker
          selectedMonth={vm.selectedMonth}
          selectedYear={vm.selectedYear}
          onMonthChange={vm.setMonth}
          onYearChange={vm.setYear}
        />
      </div>

      {vm.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.payslips.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-secondary">
          No payslips found for the selected period.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vm.payslips.map((payslip) => (
            <PayslipCard
              key={payslip.id}
              payslip={payslip}
              onView={vm.openDetailModal}
              onDownload={vm.onDownload}
            />
          ))}
        </div>
      )}

      <PayslipDetailModal
        payslip={vm.selectedPayslip}
        isOpen={Boolean(vm.selectedPayslip)}
        isAdmin={false}
        isSubmitting={false}
        onClose={vm.closeDetailModal}
        onDownload={vm.onDownload}
      />
    </>
  )
}
