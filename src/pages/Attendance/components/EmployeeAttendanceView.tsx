import { format, parseISO } from 'date-fns'
import { AttendanceCalendar } from './AttendanceCalendar'
import { MonthYearPicker } from './AttendanceFilters'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { AttendanceSummaryCards } from './AttendanceSummaryCards'
import { ClockInOutCard } from './ClockInOutCard'
import { useEmployeeAttendanceViewModel } from './EmployeeAttendanceView.viewmodel'
import { formatTime } from '../../../utils/date.utils'

export function EmployeeAttendanceView() {
  const vm = useEmployeeAttendanceViewModel()

  return (
    <>
      <ClockInOutCard
        clockStatus={vm.clockStatus}
        isLoading={vm.isLoading}
        isClockingIn={vm.isClockingIn}
        isClockingOut={vm.isClockingOut}
        onClockIn={vm.onClockIn}
        onClockOut={vm.onClockOut}
      />

      <div className="mb-6 flex justify-end">
        <MonthYearPicker
          selectedMonth={vm.selectedMonth}
          selectedYear={vm.selectedYear}
          onMonthChange={vm.setMonth}
          onYearChange={vm.setYear}
        />
      </div>

      <AttendanceSummaryCards summary={vm.summary} isLoading={vm.isLoading} />

      {!vm.isLoading && (
        <AttendanceCalendar
          month={vm.selectedMonth}
          year={vm.selectedYear}
          records={vm.records}
        />
      )}

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Day</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Working Hours</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {vm.records.map((record) => (
                <tr
                  key={record.date}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {format(parseISO(record.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {format(parseISO(record.date), 'EEEE')}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.checkIn ? formatTime(record.checkIn) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.checkOut ? formatTime(record.checkOut) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.workingHours ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <AttendanceStatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
