import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  LeaveTypeFormSchema,
  type LeaveType,
  type LeaveTypeFormInput,
} from '../../../types/leave.types'
import { cn } from '../../../utils/cn'

const PRESET_COLORS = [
  '#00D68F',
  '#FF4C61',
  '#2196F3',
  '#FF902F',
  '#6E82A0',
  '#9C27B0',
  '#795548',
]

interface LeaveTypeFormModalProps {
  isOpen: boolean
  leaveType: LeaveType | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: LeaveTypeFormInput) => void
}

export function LeaveTypeFormModal({
  isOpen,
  leaveType,
  isSubmitting,
  onClose,
  onSubmit,
}: LeaveTypeFormModalProps) {
  const form = useForm<LeaveTypeFormInput>({
    resolver: zodResolver(LeaveTypeFormSchema),
    defaultValues: {
      name: '',
      color: PRESET_COLORS[0],
      defaultDays: 0,
      carryForward: false,
      requiresDocument: false,
      isActive: true,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form

  const selectedColor = watch('color')

  useEffect(() => {
    if (!isOpen) return
    if (leaveType) {
      reset({
        name: leaveType.name,
        color: leaveType.color,
        defaultDays: leaveType.defaultDays,
        carryForward: leaveType.carryForward,
        requiresDocument: leaveType.requiresDocument,
        isActive: leaveType.isActive,
      })
    } else {
      reset({
        name: '',
        color: PRESET_COLORS[0],
        defaultDays: 0,
        carryForward: false,
        requiresDocument: false,
        isActive: true,
      })
    }
  }, [isOpen, leaveType, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={leaveType ? 'Edit Leave Type' : 'Add Leave Type'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Input
          label="Days per Year"
          type="number"
          min={0}
          error={errors.defaultDays?.message}
          {...register('defaultDays', { valueAsNumber: true })}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-primary">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn(
                  'h-8 w-8 rounded-md border-2 transition-transform',
                  selectedColor === color
                    ? 'scale-110 border-primary'
                    : 'border-transparent',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <input type="hidden" {...register('color')} />
        </div>

        <label className="flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" className="rounded" {...register('carryForward')} />
          Carry forward unused days
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" className="rounded" {...register('requiresDocument')} />
          Requires document upload
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" className="rounded" {...register('isActive')} />
          Active
        </label>
      </form>
    </Modal>
  )
}
