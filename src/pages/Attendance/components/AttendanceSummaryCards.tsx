import { CalendarDays, CheckCircle2, Clock, UserMinus, UserX } from 'lucide-react'
import type { AttendanceSummary } from '../../../types/attendance.types'
import { cn } from '../../../utils/cn'

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary | undefined
  isLoading?: boolean
}

const cards = [
  { key: 'present' as const, label: 'Present', icon: CheckCircle2, tint: 'text-success bg-[var(--state-success-bg)]' },
  { key: 'absent' as const, label: 'Absent', icon: UserX, tint: 'text-error bg-[var(--state-error-bg)]' },
  { key: 'late' as const, label: 'Late', icon: Clock, tint: 'text-warning bg-[var(--state-warning-bg)]' },
  { key: 'halfDay' as const, label: 'Half Day', icon: CalendarDays, tint: 'text-info bg-[var(--state-info-bg)]' },
  { key: 'onLeave' as const, label: 'On Leave', icon: UserMinus, tint: 'text-warning bg-[var(--state-warning-bg)]' },
]

export function AttendanceSummaryCards({ summary, isLoading }: AttendanceSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.key}
            className="animate-pulse rounded-lg border border-border/70 bg-surface p-4 shadow-card"
          >
            <div className="h-10 w-10 rounded-full bg-surface-alt" />
            <div className="mt-3 h-7 w-12 rounded bg-surface-alt" />
            <div className="mt-2 h-4 w-20 rounded bg-surface-alt" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="rounded-lg border border-border/70 bg-surface p-4 shadow-card"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                card.tint,
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-2xl font-bold text-primary">
              {summary?.[card.key] ?? 0}
            </p>
            <p className="mt-1 text-sm text-secondary">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
