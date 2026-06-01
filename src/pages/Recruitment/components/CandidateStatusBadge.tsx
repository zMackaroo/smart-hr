import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { CandidateStatus } from '../../../types/recruitment.types'

interface CandidateStatusBadgeProps {
  status: CandidateStatus
  className?: string
}

const statusConfig: Record<CandidateStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-[var(--state-info-bg)] text-info' },
  screening: { label: 'Screening', className: 'bg-[var(--state-warning-bg)] text-warning' },
  interview: { label: 'Interview', className: 'bg-[var(--state-warning-bg)] text-warning' },
  offered: { label: 'Offered', className: 'bg-[var(--state-success-bg)] text-success' },
  hired: { label: 'Hired', className: 'bg-[var(--state-success-bg)] text-success' },
  rejected: { label: 'Rejected', className: 'bg-[var(--state-error-bg)] text-error' },
}

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
