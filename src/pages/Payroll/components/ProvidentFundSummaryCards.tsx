import { Users, Wallet, PiggyBank, Building2 } from 'lucide-react'
import { formatCurrency } from '../../../utils/currency.utils'
import type { ProvidentFundSummary } from '../../../types/payroll.types'

interface ProvidentFundSummaryCardsProps {
  summary: ProvidentFundSummary | undefined
  isLoading?: boolean
}

const cards = [
  { key: 'totalEmployees' as const, label: 'Total Employees', icon: Users, format: 'number' as const },
  { key: 'activeAccounts' as const, label: 'Active Accounts', icon: Building2, format: 'number' as const },
  {
    key: 'totalEmployeeContributions' as const,
    label: 'Employee Contributions',
    icon: Wallet,
    format: 'currency' as const,
  },
  {
    key: 'totalFundBalance' as const,
    label: 'Total Fund Balance',
    icon: PiggyBank,
    format: 'currency' as const,
  },
]

export function ProvidentFundSummaryCards({
  summary,
  isLoading,
}: ProvidentFundSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.key} className="h-28 animate-pulse rounded-lg bg-surface-alt" />
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
