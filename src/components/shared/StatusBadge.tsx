import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

type StatusVariant =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'terminated'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'open'
  | 'new'

interface StatusBadgeProps {
  status: StatusVariant | string
  className?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  active: { label: 'Active', variant: 'success' },
  approved: { label: 'Approved', variant: 'success' },
  on_leave: { label: 'On Leave', variant: 'warning' },
  terminated: { label: 'Terminated', variant: 'error' },
  inactive: { label: 'Inactive', variant: 'error' },
  rejected: { label: 'Rejected', variant: 'error' },
  pending: { label: 'Pending', variant: 'warning' },
  open: { label: 'Open', variant: 'info' },
  new: { label: 'New', variant: 'info' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'default' as const }

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  )
}
