import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { TicketStatus } from '../../../types/ticket.types'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-[var(--state-info-bg)] text-info' },
  in_progress: { label: 'In Progress', className: 'bg-[var(--state-warning-bg)] text-warning' },
  resolved: { label: 'Resolved', className: 'bg-[var(--state-success-bg)] text-success' },
  closed: { label: 'Closed', className: 'bg-surface-alt text-muted' },
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
