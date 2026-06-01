import { Badge } from '../../../components/ui/Badge'
import type { PlatformUserStatus } from '../../../types/user.types'

interface UserStatusBadgeProps {
  status: PlatformUserStatus
}

const statusConfig: Record<
  PlatformUserStatus,
  { label: string; variant: 'success' | 'warning' | 'error' }
> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'error' },
  invited: { label: 'Invited', variant: 'warning' },
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status]

  return <Badge variant={config.variant}>{config.label}</Badge>
}
