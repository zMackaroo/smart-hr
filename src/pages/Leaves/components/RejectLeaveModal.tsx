import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { RejectLeaveFormSchema, type LeaveRequest } from '../../../types/leave.types'
import { formatDate } from '../../../utils/date.utils'

interface RejectLeaveModalProps {
  request: LeaveRequest | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function RejectLeaveModal({
  request,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: RejectLeaveModalProps) {
  const form = useForm<{ reason: string }>({
    resolver: zodResolver(RejectLeaveFormSchema),
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
      title="Reject Leave Request"
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
      {request && (
        <form className="space-y-4">
          <p className="text-sm text-secondary">
            Reject {request.employee.name}&apos;s {request.leaveType.name} request for{' '}
            {request.days} day{request.days === 1 ? '' : 's'} (
            {formatDate(request.fromDate)} – {formatDate(request.toDate)})?
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
