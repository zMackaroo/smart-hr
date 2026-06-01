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

const tintClasses: Record<StatTint, { bg: string; text: string }> = {
  blue: { bg: 'bg-[var(--state-info-bg)]', text: 'text-info' },
  green: { bg: 'bg-[var(--state-success-bg)]', text: 'text-success' },
  orange: { bg: 'bg-[var(--state-warning-bg)]', text: 'text-accent' },
  yellow: { bg: 'bg-[var(--state-warning-bg)]', text: 'text-warning' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
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
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            colors.bg,
          )}
        >
          <Icon className={cn('h-6 w-6', colors.text)} strokeWidth={1.5} />
        </div>
        {trend !== undefined && trendDirection && (
          <TrendBadge trend={trend} direction={trendDirection} />
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-primary">{formatStatValue(value, valueFormat)}</p>
      <p className="mt-1 text-sm text-secondary">{label}</p>
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
      <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-secondary">
        <Minus className="h-3 w-3" />
        {trend}%
      </span>
    )
  }

  const isUp = direction === 'up'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
        isUp ? 'bg-[var(--state-success-bg)] text-success' : 'bg-[var(--state-error-bg)] text-error',
      )}
    >
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {trend}%
    </span>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-full bg-surface-alt" />
        <div className="h-5 w-12 rounded-full bg-surface-alt" />
      </div>
      <div className="mt-4 h-8 w-24 rounded bg-surface-alt" />
      <div className="mt-2 h-4 w-32 rounded bg-surface-alt" />
    </div>
  )
}
