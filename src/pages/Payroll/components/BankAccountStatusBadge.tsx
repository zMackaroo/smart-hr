import { Badge } from '../../../components/ui/Badge'
import { ACCOUNT_STATUS_LABELS, type BankAccountStatus } from '../../../types/bank-account.types'

interface BankAccountStatusBadgeProps {
  status: BankAccountStatus
}

const statusConfig: Record<
  BankAccountStatus,
  { variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  active: { variant: 'success' },
  inactive: { variant: 'error' },
  pending_verification: { variant: 'warning' },
}

export function BankAccountStatusBadge({ status }: BankAccountStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{ACCOUNT_STATUS_LABELS[status]}</Badge>
}
