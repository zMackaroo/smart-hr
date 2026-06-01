import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { PayslipStatus } from '../../../types/payroll.types'

const config: Record<PayslipStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface-alt text-secondary' },
  processed: { label: 'Processed', className: 'bg-[var(--state-info-bg)] text-info' },
  paid: { label: 'Paid', className: 'bg-[var(--state-success-bg)] text-success' },
}

export function PayslipStatusBadge({ status }: { status: PayslipStatus }) {
  const item = config[status]
  return (
    <Badge variant="default" className={cn(item.className)}>
      {item.label}
    </Badge>
  )
}
