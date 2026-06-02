import type { LucideIcon } from 'lucide-react'
import { Archive, CheckCircle2, CircleDot, LoaderCircle } from 'lucide-react'
import { cn } from '../../../utils/cn'

export interface TicketStatusCounts {
  open: number
  inProgress: number
  resolved: number
  closed: number
}

interface TicketSummaryCardsProps {
  counts: TicketStatusCounts
  isLoading?: boolean
}

type CardTint = 'blue' | 'yellow' | 'green' | 'slate'

const cards: Array<{
  key: keyof TicketStatusCounts
  label: string
  icon: LucideIcon
  tint: CardTint
}> = [
  { key: 'open', label: 'Open', icon: CircleDot, tint: 'blue' },
  { key: 'inProgress', label: 'In Progress', icon: LoaderCircle, tint: 'yellow' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, tint: 'green' },
  { key: 'closed', label: 'Closed', icon: Archive, tint: 'slate' },
]

const tintClasses: Record<
  CardTint,
  { iconBg: string; iconText: string; accent: string; glow: string; value: string }
> = {
  blue: {
    iconBg: 'bg-[var(--state-info-bg)]',
    iconText: 'text-info',
    accent: 'border-l-info',
    glow: 'from-[var(--state-info-bg)]',
    value: 'text-info',
  },
  yellow: {
    iconBg: 'bg-[var(--state-warning-bg)]',
    iconText: 'text-warning',
    accent: 'border-l-warning',
    glow: 'from-[var(--state-warning-bg)]',
    value: 'text-warning',
  },
  green: {
    iconBg: 'bg-[var(--state-success-bg)]',
    iconText: 'text-success',
    accent: 'border-l-success',
    glow: 'from-[var(--state-success-bg)]',
    value: 'text-success',
  },
  slate: {
    iconBg: 'bg-surface-alt',
    iconText: 'text-muted',
    accent: 'border-l-border',
    glow: 'from-surface-alt',
    value: 'text-secondary',
  },
}

function SummaryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border/70 border-l-4 border-l-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="h-3 w-20 rounded bg-surface-alt" />
        <div className="h-10 w-10 rounded-lg bg-surface-alt" />
      </div>
      <div className="mt-3 h-8 w-10 rounded bg-surface-alt" />
    </div>
  )
}

export function TicketSummaryCards({ counts, isLoading }: TicketSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <SummaryCardSkeleton key={card.key} />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const colors = tintClasses[card.tint]
        const value = counts[card.key]

        return (
          <div
            key={card.key}
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
                {card.label}
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

            <p
              className={cn(
                'relative mt-3 text-2xl font-bold tabular-nums leading-none tracking-tight xl:text-[1.75rem]',
                colors.value,
              )}
            >
              {value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
