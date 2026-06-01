import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { ExpenseStatus } from '../../../types/expense.types'

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus
}

const statusConfig: Record<
  ExpenseStatus,
  {
    label: string
    className: string
    variant: 'default' | 'success' | 'warning' | 'error' | 'info'
  }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-[var(--state-warning-bg)] text-warning',
    variant: 'warning',
  },
  approved: {
    label: 'Approved',
    className: 'bg-[var(--state-success-bg)] text-success',
    variant: 'success',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[var(--state-error-bg)] text-error',
    variant: 'error',
  },
  reimbursed: {
    label: 'Reimbursed',
    className: 'bg-[var(--state-info-bg)] text-info',
    variant: 'info',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-surface-alt text-secondary',
    variant: 'default',
  },
}

export function ExpenseStatusBadge({ status }: ExpenseStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
