import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { calculateLeaveDays } from '../../../api/leaves.api'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  ApplyLeaveFormSchema,
  type ApplyLeaveFormInput,
  type LeaveBalance,
  type LeaveType,
} from '../../../types/leave.types'

interface ApplyLeaveModalProps {
  isOpen: boolean
  leaveTypes: LeaveType[]
  balances: LeaveBalance[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: ApplyLeaveFormInput) => void
}

export function ApplyLeaveModal({
  isOpen,
  leaveTypes,
  balances,
  isSubmitting,
  onClose,
  onSubmit,
}: ApplyLeaveModalProps) {
  const activeTypes = leaveTypes.filter((lt) => lt.isActive)

  const form = useForm<ApplyLeaveFormInput>({
    resolver: zodResolver(ApplyLeaveFormSchema),
    defaultValues: {
      leaveTypeId: '',
      fromDate: '',
      toDate: '',
      reason: '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = form

  const leaveTypeId = watch('leaveTypeId')
  const fromDate = watch('fromDate')
  const toDate = watch('toDate')

  const selectedType = activeTypes.find((lt) => lt.id === leaveTypeId)
  const selectedBalance = balances.find((b) => b.leaveTypeId === leaveTypeId)

  const calculatedDays = useMemo(() => {
    if (!fromDate || !toDate) return 0
    if (new Date(toDate) < new Date(fromDate)) return 0
    return calculateLeaveDays(fromDate, toDate)
  }, [fromDate, toDate])

  useEffect(() => {
    if (!isOpen) return
    reset({
      leaveTypeId: '',
      fromDate: '',
      toDate: '',
      reason: '',
    })
  }, [isOpen, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Leave Type</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            {...register('leaveTypeId')}
          >
            <option value="">Select leave type</option>
            {activeTypes.map((lt) => {
              const balance = balances.find((b) => b.leaveTypeId === lt.id)
              return (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                  {balance ? ` (${balance.remaining} days left)` : ''}
                </option>
              )
            })}
          </select>
          {errors.leaveTypeId && (
            <p className="mt-1 text-xs text-error">{errors.leaveTypeId.message}</p>
          )}
          {selectedBalance && (
            <p className="mt-1 text-xs text-secondary">
              {selectedBalance.remaining} of {selectedBalance.allocated} days remaining
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="From Date" type="date" error={errors.fromDate?.message} {...register('fromDate')} />
          <Input label="To Date" type="date" error={errors.toDate?.message} {...register('toDate')} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Number of Days</label>
          <div className="flex h-10 items-center rounded-md border border-border bg-surface-alt px-3 text-sm text-primary">
            {calculatedDays > 0 ? `${calculatedDays} day${calculatedDays === 1 ? '' : 's'}` : '—'}
          </div>
          <p className="mt-1 text-xs text-secondary">Weekdays only (excludes weekends)</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Reason</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('reason')}
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-error">{errors.reason.message}</p>
          )}
        </div>

        {selectedType?.requiresDocument && (
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              Upload Document
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full text-sm text-secondary"
              onChange={(e) => {
                const file = e.target.files?.[0]
                form.setValue('document', file)
              }}
            />
            <p className="mt-1 text-xs text-secondary">Required for {selectedType.name}</p>
          </div>
        )}
      </form>
    </Modal>
  )
}
