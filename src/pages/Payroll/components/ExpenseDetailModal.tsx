import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import {
  STATUS_LABELS,
  type ExpenseClaim,
} from '../../../types/expense.types'
import { formatCurrency } from '../../../utils/currency.utils'
import { formatDate } from '../../../utils/date.utils'
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge'
import { ExpenseStatusBadge } from './ExpenseStatusBadge'

interface ExpenseDetailModalProps {
  claim: ExpenseClaim | null
  isOpen: boolean
  isAdmin?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onApprove?: (id: string) => void
  onReject?: (claim: ExpenseClaim) => void
  onMarkReimbursed?: (id: string) => void
}

export function ExpenseDetailModal({
  claim,
  isOpen,
  isAdmin = false,
  isSubmitting = false,
  onClose,
  onApprove,
  onReject,
  onMarkReimbursed,
}: ExpenseDetailModalProps) {
  if (!claim) return null

  const showApprove = isAdmin && claim.status === 'pending'
  const showReject = isAdmin && claim.status === 'pending'
  const showReimburse = isAdmin && claim.status === 'approved'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Claim ${claim.claimNumber}`}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          {showReject && onReject && (
            <PermissionGate module="expenses" action="approve">
              <Button variant="destructive" onClick={() => onReject(claim)} disabled={isSubmitting}>
                Reject
              </Button>
            </PermissionGate>
          )}
          {showApprove && onApprove && (
            <PermissionGate module="expenses" action="approve">
              <Button onClick={() => onApprove(claim.id)} disabled={isSubmitting}>
                Approve
              </Button>
            </PermissionGate>
          )}
          {showReimburse && onMarkReimbursed && (
            <PermissionGate module="expenses" action="approve">
              <Button onClick={() => onMarkReimbursed(claim.id)} disabled={isSubmitting}>
                Mark Reimbursed
              </Button>
            </PermissionGate>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={claim.employee.name}
            avatarUrl={claim.employee.avatarUrl}
            seed={claim.employee.id}
            size="sm"
          />
          <div>
            <p className="font-medium text-primary">{claim.employee.name}</p>
            <p className="text-sm text-secondary">
              {claim.employee.employeeId} · {claim.employee.department}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Title" value={claim.title} />
          <DetailItem label="Amount" value={formatCurrency(claim.amount)} />
          <DetailItem label="Category" value={<ExpenseCategoryBadge category={claim.category} />} />
          <DetailItem label="Status" value={<ExpenseStatusBadge status={claim.status} />} />
          <DetailItem label="Expense Date" value={formatDate(claim.expenseDate)} />
          <DetailItem label="Submitted" value={formatDate(claim.submittedDate.split('T')[0])} />
        </div>

        {claim.description && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary">Description</p>
            <p className="mt-1 text-sm text-primary">{claim.description}</p>
          </div>
        )}

        {claim.receiptUrl && (
          <a
            href={claim.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            View Receipt
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {claim.rejectionReason && (
          <div className="rounded-lg border border-error/20 bg-[var(--state-error-bg)] p-3">
            <p className="text-xs font-medium text-error">Rejection Reason</p>
            <p className="mt-1 text-sm text-primary">{claim.rejectionReason}</p>
          </div>
        )}

        {(claim.reviewedBy || claim.reimbursedDate) && (
          <div className="rounded-lg bg-surface-alt p-3 text-sm text-secondary">
            {claim.reviewedBy && (
              <p>
                Reviewed by {claim.reviewedBy.name}
                {claim.reviewedDate ? ` on ${formatDate(claim.reviewedDate.split('T')[0])}` : ''}
              </p>
            )}
            {claim.reimbursedDate && (
              <p className="mt-1">Reimbursed on {formatDate(claim.reimbursedDate)}</p>
            )}
            {!claim.reviewedBy && (
              <p>Status: {STATUS_LABELS[claim.status]}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-secondary">{label}</p>
      <div className="mt-1 text-sm text-primary">{value}</div>
    </div>
  )
}
