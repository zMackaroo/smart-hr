import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { StatCardData } from '../../../types/dashboard.types'
import { formatStatValue } from '../../../utils/currency.utils'
import { cn } from '../../../utils/cn'

type StatTint = 'blue' | 'green' | 'orange' | 'yellow' | 'purple' | 'teal'

interface StatCardProps extends StatCardData {
  icon: LucideIcon
  tint: StatTint
  valueFormat?: 'number' | 'currency'
}

const tintClasses: Record<
  StatTint,
  { iconBg: string; iconText: string; accent: string; glow: string }
> = {
  blue: {
    iconBg: 'bg-[var(--state-info-bg)]',
    iconText: 'text-info',
    accent: 'border-l-info',
    glow: 'from-[var(--state-info-bg)]',
  },
  green: {
    iconBg: 'bg-[var(--state-success-bg)]',
    iconText: 'text-success',
    accent: 'border-l-success',
    glow: 'from-[var(--state-success-bg)]',
  },
  orange: {
    iconBg: 'bg-[var(--state-warning-bg)]',
    iconText: 'text-accent',
    accent: 'border-l-accent',
    glow: 'from-[var(--state-warning-bg)]',
  },
  yellow: {
    iconBg: 'bg-[var(--state-warning-bg)]',
    iconText: 'text-warning',
    accent: 'border-l-warning',
    glow: 'from-[var(--state-warning-bg)]',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    accent: 'border-l-purple-500',
    glow: 'from-purple-50',
  },
  teal: {
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
    accent: 'border-l-teal-500',
    glow: 'from-teal-50',
  },
}

export function StatCard({
  label,
  value,
  trend,
  trendDirection,
  icon: Icon,
  tint,
  valueFormat = 'number',
}: StatCardProps) {
  const colors = tintClasses[tint]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border/70 border-l-4 bg-surface p-4 shadow-card',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        colors.accent,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br to-transparent opacity-60',
          colors.glow,
        )}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="pt-0.5 text-xs font-semibold uppercase tracking-wide text-secondary">
          {label}
        </p>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            colors.iconBg,
          )}
        >
          <Icon className={cn('h-5 w-5', colors.iconText)} strokeWidth={1.75} />
        </div>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-primary xl:text-[1.75rem]">
          {formatStatValue(value, valueFormat)}
        </p>
        {trend !== undefined && trendDirection && (
          <TrendBadge trend={trend} direction={trendDirection} />
        )}
      </div>
    </div>
  )
}

function TrendBadge({
  trend,
  direction,
}: {
  trend: number
  direction: 'up' | 'down' | 'neutral'
}) {
  if (direction === 'neutral') {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--state-info-bg)] px-2 py-1 text-xs font-semibold text-info">
        <Minus className="h-3 w-3" aria-hidden />
        {trend}%
      </span>
    )
  }

  const isUp = direction === 'up'
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold',
        isUp
          ? 'bg-[var(--state-success-bg)] text-success'
          : 'bg-[var(--state-error-bg)] text-error',
      )}
    >
      {isUp ? (
        <ArrowUp className="h-3 w-3" aria-hidden />
      ) : (
        <ArrowDown className="h-3 w-3" aria-hidden />
      )}
      {trend}%
    </span>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border/70 border-l-4 border-l-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="h-3 w-24 rounded bg-surface-alt" />
        <div className="h-10 w-10 rounded-lg bg-surface-alt" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="h-8 w-20 rounded bg-surface-alt" />
        <div className="h-6 w-12 rounded-full bg-surface-alt" />
      </div>
    </div>
  )
}
