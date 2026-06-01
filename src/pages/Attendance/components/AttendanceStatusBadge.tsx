import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { AttendanceStatus } from '../../../types/attendance.types'

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus
  className?: string
}

const statusConfig: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  present: { label: 'Present', className: 'bg-[var(--state-success-bg)] text-success' },
  absent: { label: 'Absent', className: 'bg-[var(--state-error-bg)] text-error' },
  late: { label: 'Late', className: 'bg-[var(--state-warning-bg)] text-warning' },
  half_day: { label: 'Half Day', className: 'bg-[var(--state-info-bg)] text-info' },
  on_leave: { label: 'On Leave', className: 'bg-[var(--state-warning-bg)] text-warning' },
  holiday: { label: 'Holiday', className: 'bg-surface-alt text-muted' },
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

export function getAttendanceStatusColor(status: AttendanceStatus): string {
  const colors: Record<AttendanceStatus, string> = {
    present: 'bg-success',
    absent: 'bg-error',
    late: 'bg-accent',
    half_day: 'bg-warning',
    on_leave: 'bg-info',
    holiday: 'bg-muted',
  }
  return colors[status]
}
