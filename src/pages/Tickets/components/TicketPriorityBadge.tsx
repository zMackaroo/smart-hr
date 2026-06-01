import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { TicketPriority } from '../../../types/ticket.types'

interface TicketPriorityBadgeProps {
  priority: TicketPriority
  className?: string
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-surface-alt text-secondary' },
  medium: { label: 'Medium', className: 'bg-[var(--state-info-bg)] text-info' },
  high: { label: 'High', className: 'bg-[var(--state-warning-bg)] text-warning' },
  urgent: { label: 'Urgent', className: 'bg-[var(--state-error-bg)] text-error' },
}

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
