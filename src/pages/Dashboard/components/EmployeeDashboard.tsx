import { AlertCircle, Calendar, Clock, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Badge } from '../../../components/ui/Badge'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { formatTime } from '../../../utils/date.utils'
import { DashboardErrorBanner } from './DashboardErrorBanner'
import { StatCard, StatCardSkeleton } from './StatCard'
import { UpcomingHolidays } from './UpcomingHolidays'
import { useEmployeeDashboardViewModel } from './EmployeeDashboard.viewmodel'
import type { EmployeeDashboard } from '../../../types/dashboard.types'

const attendanceStatusConfig: Record<
  EmployeeDashboard['todayAttendance']['status'],
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  present: { label: 'Present', variant: 'success' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'error' },
  not_marked: { label: 'Not Marked', variant: 'default' },
}

export function EmployeeDashboard() {
  const { data, isLoading, error, retry } = useEmployeeDashboardViewModel()

  if (error) {
    return <DashboardErrorBanner message={error} onRetry={retry} />
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="animate-pulse rounded-lg border border-border/70 bg-surface p-6 shadow-card">
          <div className="h-5 w-40 rounded bg-surface-alt" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded bg-surface-alt" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { stats, todayAttendance } = data
  const status = attendanceStatusConfig[todayAttendance.status]
  const notCheckedIn = todayAttendance.status === 'not_marked'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard {...stats.attendanceThisMonth} icon={Clock} tint="blue" />
        <StatCard {...stats.leavesBalance} icon={Calendar} tint="green" />
        <StatCard {...stats.pendingLeaves} icon={AlertCircle} tint="orange" />
        <StatCard {...stats.openTickets} icon={Ticket} tint="yellow" />
      </div>

      <div className="rounded-lg border border-border/70 bg-surface p-6 shadow-card">
        <h3 className="text-base font-semibold text-primary">Today&apos;s Attendance</h3>
        {notCheckedIn ? (
          <p className="mt-4 text-sm text-secondary">
            You haven&apos;t checked in yet. Head to the{' '}
            <Link to="/attendance" className="font-medium text-accent hover:text-accent-dark">
              Attendance page
            </Link>{' '}
            to clock in.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">Check In</p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {todayAttendance.checkIn ? formatTime(todayAttendance.checkIn) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">Check Out</p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">
                Working Hours
              </p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {todayAttendance.workingHours ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-secondary">Status</p>
              <div className="mt-1">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-primary">Leave History</h3>
            <Link to="/leaves" className="text-sm font-medium text-accent hover:text-accent-dark">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">From – To</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.leaveHistory.slice(0, 5).map((leave) => (
                  <tr key={leave.id} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-primary">{leave.type}</td>
                    <td className="px-5 py-3.5 text-sm text-secondary">
                      {format(parseISO(leave.from), 'MMM d')} –{' '}
                      {format(parseISO(leave.to), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-primary">{leave.days}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <UpcomingHolidays holidays={data.upcomingHolidays} />
      </div>
    </div>
  )
}
