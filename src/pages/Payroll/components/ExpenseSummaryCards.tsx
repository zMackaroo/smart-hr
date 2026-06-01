import { Clock, CheckCircle2, Wallet, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../../utils/currency.utils'
import type { ExpenseListSummary } from '../../../types/expense.types'

interface ExpenseSummaryCardsProps {
  summary: ExpenseListSummary | undefined
  isLoading?: boolean
}

const cards = [
  { key: 'pending' as const, label: 'Pending', icon: Clock, format: 'number' as const },
  { key: 'approved' as const, label: 'Approved', icon: CheckCircle2, format: 'number' as const },
  { key: 'reimbursed' as const, label: 'Reimbursed', icon: Wallet, format: 'number' as const },
  {
    key: 'pendingAmount' as const,
    label: 'Pending Amount',
    icon: DollarSign,
    format: 'currency' as const,
  },
]

export function ExpenseSummaryCards({ summary, isLoading }: ExpenseSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="h-28 animate-pulse rounded-lg bg-surface-alt" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const value = summary?.[card.key] ?? 0
        return (
          <div
            key={card.key}
            className="rounded-lg border border-border/70 bg-surface p-4 shadow-card"
          >
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="mt-3 text-xl font-bold text-primary">
              {card.format === 'currency' ? formatCurrency(value) : value}
            </p>
            <p className="mt-1 text-sm text-secondary">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
