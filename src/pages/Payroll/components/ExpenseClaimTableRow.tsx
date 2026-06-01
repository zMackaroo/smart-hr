import { Check, Eye, MoreHorizontal, Wallet, X } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Dropdown } from '../../../components/ui/Dropdown'
import { Button } from '../../../components/ui/Button'
import type { ExpenseClaim } from '../../../types/expense.types'
import { formatCurrency } from '../../../utils/currency.utils'
import { formatDate } from '../../../utils/date.utils'
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge'
import { ExpenseStatusBadge } from './ExpenseStatusBadge'

interface ExpenseClaimTableRowProps {
  claim: ExpenseClaim
  variant: 'admin' | 'employee'
  onView: (claim: ExpenseClaim) => void
  onApprove?: (id: string) => void
  onReject?: (claim: ExpenseClaim) => void
  onMarkReimbursed?: (id: string) => void
  onCancel?: (claim: ExpenseClaim) => void
}

export function ExpenseClaimTableRow({
  claim,
  variant,
  onView,
  onApprove,
  onReject,
  onMarkReimbursed,
  onCancel,
}: ExpenseClaimTableRowProps) {
  const adminItems = [
    { label: 'View', onClick: () => onView(claim) },
    ...(claim.status === 'pending' && onApprove
      ? [{ label: 'Approve', onClick: () => onApprove(claim.id) }]
      : []),
    ...(claim.status === 'pending' && onReject
      ? [{ label: 'Reject', onClick: () => onReject(claim), destructive: true }]
      : []),
    ...(claim.status === 'approved' && onMarkReimbursed
      ? [{ label: 'Mark Reimbursed', onClick: () => onMarkReimbursed(claim.id) }]
      : []),
  ]

  return (
    <tr className="border-b border-border/50 last:border-b-0 hover:bg-surface-alt/50">
      <td className="px-5 py-3 font-mono text-sm text-secondary">{claim.claimNumber}</td>
      {variant === 'admin' && (
        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={claim.employee.name}
              avatarUrl={claim.employee.avatarUrl}
              seed={claim.employee.id}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium text-primary">{claim.employee.name}</p>
              <p className="text-xs text-secondary">{claim.employee.department}</p>
            </div>
          </div>
        </td>
      )}
      <td className="px-5 py-3 text-sm text-primary">{claim.title}</td>
      <td className="px-5 py-3">
        <ExpenseCategoryBadge category={claim.category} />
      </td>
      <td className="px-5 py-3 text-sm font-medium text-primary">
        {formatCurrency(claim.amount)}
      </td>
      <td className="px-5 py-3 text-sm text-secondary">{formatDate(claim.expenseDate)}</td>
      <td className="px-5 py-3 text-sm text-secondary">
        {formatDate(claim.submittedDate.split('T')[0])}
      </td>
      <td className="px-5 py-3">
        <ExpenseStatusBadge status={claim.status} />
      </td>
      <td className="px-5 py-3">
        {variant === 'admin' ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView(claim)} aria-label="View claim">
              <Eye className="h-4 w-4" />
            </Button>
            {claim.status === 'pending' && onApprove && (
              <PermissionGate module="expenses" action="approve">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApprove(claim.id)}
                  aria-label="Approve claim"
                >
                  <Check className="h-4 w-4 text-success" />
                </Button>
              </PermissionGate>
            )}
            {claim.status === 'pending' && onReject && (
              <PermissionGate module="expenses" action="approve">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(claim)}
                  aria-label="Reject claim"
                >
                  <X className="h-4 w-4 text-error" />
                </Button>
              </PermissionGate>
            )}
            {claim.status === 'approved' && onMarkReimbursed && (
              <PermissionGate module="expenses" action="approve">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkReimbursed(claim.id)}
                  aria-label="Mark reimbursed"
                >
                  <Wallet className="h-4 w-4 text-info" />
                </Button>
              </PermissionGate>
            )}
            <Dropdown
              trigger={
                <span className="inline-flex rounded p-1 hover:bg-surface-alt">
                  <MoreHorizontal className="h-4 w-4 text-secondary" />
                </span>
              }
              items={adminItems}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(claim)}>
              View
            </Button>
            {claim.status === 'pending' && onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(claim)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}
