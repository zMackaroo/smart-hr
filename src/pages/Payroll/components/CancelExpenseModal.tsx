import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { ExpenseClaim } from '../../../types/expense.types'
import { formatCurrency } from '../../../utils/currency.utils'

interface CancelExpenseModalProps {
  claim: ExpenseClaim | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CancelExpenseModal({
  claim,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: CancelExpenseModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Cancel Expense Claim"
      message={
        claim ? (
          <>
            Are you sure you want to cancel claim &quot;{claim.title}&quot; for{' '}
            {formatCurrency(claim.amount)}? This action cannot be undone.
          </>
        ) : (
          ''
        )
      }
      confirmLabel={isSubmitting ? 'Cancelling...' : 'Cancel Claim'}
      cancelLabel="Keep Claim"
      isLoading={isSubmitting}
      destructive
    />
  )
}
