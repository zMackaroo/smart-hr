import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { ReferralStatus } from '../../../types/recruitment.types'

interface ReferralStatusBadgeProps {
  status: ReferralStatus
  className?: string
}

const statusConfig: Record<ReferralStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-[var(--state-warning-bg)] text-warning' },
  reviewed: { label: 'Reviewed', className: 'bg-[var(--state-info-bg)] text-info' },
  accepted: { label: 'Accepted', className: 'bg-[var(--state-success-bg)] text-success' },
  rejected: { label: 'Rejected', className: 'bg-[var(--state-error-bg)] text-error' },
}

export function ReferralStatusBadge({ status, className }: ReferralStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
