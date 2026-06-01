import { StatusBadge } from '../../../components/shared/StatusBadge'
import type { LeaveStatus } from '../../../types/leave.types'

interface LeaveStatusBadgeProps {
  status: LeaveStatus
}

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const variantMap: Record<LeaveStatus, string> = {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    cancelled: 'inactive',
  }

  return <StatusBadge status={variantMap[status]} />
}
