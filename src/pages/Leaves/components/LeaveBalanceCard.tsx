import { cn } from '../../../utils/cn'
import type { LeaveBalance } from '../../../types/leave.types'

interface LeaveBalanceCardProps {
  balance: LeaveBalance
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const progress =
    balance.allocated > 0
      ? Math.round((balance.remaining / balance.allocated) * 100)
      : 0

  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: balance.color }}
        />
        <h3 className="text-sm font-semibold text-primary">{balance.leaveTypeName}</h3>
      </div>

      <p className="mt-4 text-2xl font-bold text-primary">
        {balance.used}{' '}
        <span className="text-base font-normal text-secondary">/ {balance.allocated}</span>
      </p>
      <p className="mt-1 text-xs text-secondary">Used / Allocated</p>

      <p className="mt-3 text-sm font-medium text-primary">
        {balance.remaining} remaining
        {balance.pending > 0 && (
          <span className="ml-1 font-normal text-secondary">
            ({balance.pending} pending)
          </span>
        )}
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-alt">
        <div
          className={cn('h-full rounded-full transition-all')}
          style={{ width: `${progress}%`, backgroundColor: balance.color }}
        />
      </div>
    </div>
  )
}
