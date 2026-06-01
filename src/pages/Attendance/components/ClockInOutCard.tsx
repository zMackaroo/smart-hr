import { format, parseISO } from 'date-fns'
import { Button } from '../../../components/ui/Button'
import type { ClockStatus } from '../../../types/attendance.types'
import { formatTime } from '../../../utils/date.utils'

interface ClockInOutCardProps {
  clockStatus: ClockStatus | undefined
  isLoading: boolean
  isClockingIn: boolean
  isClockingOut: boolean
  onClockIn: () => void
  onClockOut: () => void
}

export function ClockInOutCard({
  clockStatus,
  isLoading,
  isClockingIn,
  isClockingOut,
  onClockIn,
  onClockOut,
}: ClockInOutCardProps) {
  const today = clockStatus?.date ?? format(new Date(), 'yyyy-MM-dd')
  const todayLabel = format(parseISO(today), 'EEEE, MMMM dd yyyy')
  const isCompleted = Boolean(clockStatus?.checkOut)
  const isClockedIn = Boolean(clockStatus?.isClockedIn)

  return (
    <div className="mb-6 rounded-lg border border-border/70 bg-surface p-6 shadow-card">
      <p className="text-sm font-medium text-secondary">Today — {todayLabel}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Check In</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {isLoading ? '—' : clockStatus?.checkIn ? formatTime(clockStatus.checkIn) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Check Out</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {isLoading ? '—' : clockStatus?.checkOut ? formatTime(clockStatus.checkOut) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Working Hours</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {isLoading ? '—' : clockStatus?.workingHours ?? '—'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isCompleted ? (
          <Button disabled className="min-w-[140px]">
            Completed
          </Button>
        ) : isClockedIn ? (
          <Button
            onClick={onClockOut}
            disabled={isClockingOut}
            className="min-w-[140px]"
          >
            {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
          </Button>
        ) : (
          <Button onClick={onClockIn} disabled={isClockingIn} className="min-w-[140px]">
            {isClockingIn ? 'Clocking In...' : 'Clock In'}
          </Button>
        )}
      </div>
    </div>
  )
}
