import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useState } from 'react'
import type { MyAttendanceRecord } from '../../../types/attendance.types'
import { formatTime } from '../../../utils/date.utils'
import { cn } from '../../../utils/cn'
import { AttendanceStatusBadge, getAttendanceStatusColor } from './AttendanceStatusBadge'

interface AttendanceCalendarProps {
  month: number
  year: number
  records: MyAttendanceRecord[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AttendanceCalendar({ month, year, records }: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthDate = new Date(year, month - 1, 1)
  const calendarStart = startOfWeek(startOfMonth(monthDate))
  const calendarEnd = endOfWeek(endOfMonth(monthDate))
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const recordMap = new Map(records.map((r) => [r.date, r]))
  const selectedRecord = selectedDate ? recordMap.get(selectedDate) : undefined

  return (
    <div className="relative mb-6 rounded-lg border border-border/70 bg-surface p-4 shadow-card">
      <h3 className="mb-4 text-base font-semibold text-primary">
        {format(monthDate, 'MMMM yyyy')}
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium uppercase text-secondary">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const record = recordMap.get(dateKey)
          const inMonth = isSameMonth(day, monthDate)
          const isSelected = selectedDate === dateKey

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors',
                inMonth ? 'border-border/60 bg-surface-alt/40' : 'border-transparent bg-transparent text-muted',
                isToday(day) && inMonth && 'ring-2 ring-accent/40',
                isSelected && 'border-accent bg-accent/5',
              )}
            >
              <span className={cn('font-medium', inMonth ? 'text-primary' : 'text-muted')}>
                {format(day, 'd')}
              </span>
              {record && inMonth && (
                <span
                  className={cn(
                    'mt-1 h-1.5 w-1.5 rounded-full',
                    getAttendanceStatusColor(record.status),
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {selectedRecord && selectedDate && (
        <div className="absolute bottom-4 right-4 z-10 w-64 rounded-lg border border-border bg-surface p-4 shadow-lg">
          <p className="text-sm font-semibold text-primary">
            {format(parseISO(selectedDate), 'EEEE, MMM d')}
          </p>
          <div className="mt-2 space-y-1 text-sm text-secondary">
            <p>Check In: {selectedRecord.checkIn ? formatTime(selectedRecord.checkIn) : '—'}</p>
            <p>Check Out: {selectedRecord.checkOut ? formatTime(selectedRecord.checkOut) : '—'}</p>
            <p>Working Hours: {selectedRecord.workingHours ?? '—'}</p>
          </div>
          <div className="mt-3">
            <AttendanceStatusBadge status={selectedRecord.status} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-secondary">
        <LegendItem color="bg-success" label="Present" />
        <LegendItem color="bg-error" label="Absent" />
        <LegendItem color="bg-accent" label="Late" />
        <LegendItem color="bg-warning" label="Half Day" />
        <LegendItem color="bg-info" label="On Leave" />
        <LegendItem color="bg-muted" label="Holiday" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', color)} />
      {label}
    </span>
  )
}
