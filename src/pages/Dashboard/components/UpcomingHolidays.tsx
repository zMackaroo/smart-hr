import { format, parseISO } from 'date-fns'
import type { AdminDashboard, EmployeeDashboard } from '../../../types/dashboard.types'

type Holiday = AdminDashboard['upcomingHolidays'][number] | EmployeeDashboard['upcomingHolidays'][number]

interface UpcomingHolidaysProps {
  holidays: Holiday[]
}

export function UpcomingHolidays({ holidays }: UpcomingHolidaysProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <h3 className="text-base font-semibold text-primary">Upcoming Holidays</h3>
      <ul className="mt-4 space-y-3">
        {holidays.slice(0, 5).map((holiday) => (
          <li
            key={holiday.id}
            className="flex items-center gap-3 rounded-lg bg-surface-alt px-3 py-2.5"
          >
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-surface text-center shadow-sm">
              <span className="text-xs font-medium uppercase text-accent">
                {format(parseISO(holiday.date), 'MMM')}
              </span>
              <span className="text-sm font-bold leading-none text-primary">
                {format(parseISO(holiday.date), 'd')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{holiday.name}</p>
              <p className="text-xs text-secondary">{holiday.day}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
