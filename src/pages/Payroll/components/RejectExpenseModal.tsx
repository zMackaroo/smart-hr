import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import {
  RejectExpenseFormSchema,
  type ExpenseClaim,
} from '../../../types/expense.types'
import { formatCurrency } from '../../../utils/currency.utils'

interface RejectExpenseModalProps {
  claim: ExpenseClaim | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function RejectExpenseModal({
  claim,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RejectExpenseModalProps) {
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(RejectExpenseFormSchema),
    defaultValues: { reason: '' },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  useEffect(() => {
    if (isOpen) reset({ reason: '' })
  }, [isOpen, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Expense Claim"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit((data) => onConfirm(data.reason))}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </Button>
        </>
      }
    >
      {claim && (
        <form className="space-y-4">
          <p className="text-sm text-secondary">
            Reject {claim.employee.name}&apos;s claim &quot;{claim.title}&quot; for{' '}
            {formatCurrency(claim.amount)}?
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Rejection Reason
            </label>
            <textarea
              className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              placeholder="Provide a reason for rejection..."
              {...register('reason')}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-error">{errors.reason.message}</p>
            )}
          </div>
        </form>
      )}
    </Modal>
  )
}
