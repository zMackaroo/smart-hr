import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import {
  CreateTicketFormSchema,
  CATEGORY_LABELS,
  type CreateTicketFormInput,
  type TicketCategory,
  type TicketPriority,
} from '../../../types/ticket.types'

interface CreateTicketModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: CreateTicketFormInput) => void
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TicketCategory[]
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent']

export function CreateTicketModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateTicketModalProps) {
  const form = useForm<CreateTicketFormInput>({
    resolver: zodResolver(CreateTicketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: 'general',
      priority: 'medium',
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

  useEffect(() => {
    if (isOpen) {
      reset({ subject: '', description: '', category: 'general', priority: 'medium' })
    }
  }, [isOpen, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Ticket"
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input label="Subject" error={errors.subject?.message} {...register('subject')} />

        <Select
          label="Category"
          value={watch('category')}
          onChange={(v) => setValue('category', v as TicketCategory, { shouldValidate: true })}
          searchable={false}
          options={CATEGORIES.map((cat) => ({
            value: cat,
            label: CATEGORY_LABELS[cat],
          }))}
        />

        <Select
          label="Priority"
          value={watch('priority')}
          onChange={(v) => setValue('priority', v as TicketPriority, { shouldValidate: true })}
          searchable={false}
          options={PRIORITIES.map((p) => ({
            value: p,
            label: p.charAt(0).toUpperCase() + p.slice(1),
          }))}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-[100px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error">{errors.description.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
