import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatTime } from '../../../utils/date.utils'
import type { AdminDashboard } from '../../../types/dashboard.types'

interface TodayAttendanceTableProps {
  records: AdminDashboard['todayAttendance']
}

const statusConfig: Record<
  AdminDashboard['todayAttendance'][number]['status'],
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' }
> = {
  present: { label: 'Present', variant: 'success' },
  absent: { label: 'Absent', variant: 'error' },
  late: { label: 'Late', variant: 'warning' },
  half_day: { label: 'Half Day', variant: 'info' },
}

export function TodayAttendanceTable({ records }: TodayAttendanceTableProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold text-primary">Today&apos;s Attendance</h3>
        <Link to="/attendance" className="text-sm font-medium text-accent hover:text-accent-dark">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Check In</th>
              <th className="px-5 py-3">Check Out</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 5).map((record) => {
              const status = statusConfig[record.status]
              return (
                <tr key={record.id} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={record.employeeName} avatarUrl={record.avatarUrl} size="sm" />
                      <span className="text-sm font-medium text-primary">{record.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{record.department}</td>
                  <td className="px-5 py-3.5 text-sm text-primary">
                    {record.checkIn ? formatTime(record.checkIn) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-primary">
                    {record.checkOut ? formatTime(record.checkOut) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TableSkeleton({ title }: { title: string }) {
  return (
    <div className="animate-pulse rounded-lg border border-border/70 bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="h-5 w-40 rounded bg-surface-alt" />
        <div className="h-4 w-16 rounded bg-surface-alt" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-surface-alt" />
        ))}
      </div>
      <span className="sr-only">{title}</span>
    </div>
  )
}
