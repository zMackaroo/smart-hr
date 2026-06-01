import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
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
    formState: { errors },
  } = form

  useEffect(() => {
    if (isOpen) {
      reset({ subject: '', description: '', category: 'general', priority: 'medium' })
    }
  }, [isOpen, reset])

  const selectClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

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

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Category</label>
          <select className={selectClass} {...register('category')}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Priority</label>
          <select className={selectClass} {...register('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

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
