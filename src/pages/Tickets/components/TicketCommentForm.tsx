import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { AddCommentFormSchema, type AddCommentFormInput } from '../../../types/ticket.types'

interface TicketCommentFormProps {
  isAdmin: boolean
  isDisabled: boolean
  isSubmitting: boolean
  onSubmit: (data: AddCommentFormInput) => void
}

export function TicketCommentForm({
  isAdmin,
  isDisabled,
  isSubmitting,
  onSubmit,
}: TicketCommentFormProps) {
  const form = useForm<AddCommentFormInput>({
    resolver: zodResolver(AddCommentFormSchema),
    defaultValues: { body: '', isInternal: false },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  useEffect(() => {
    if (isDisabled) reset({ body: '', isInternal: false })
  }, [isDisabled, reset])

  const submit = handleSubmit((data) => {
    onSubmit(data)
    reset({ body: '', isInternal: false })
  })

  if (isDisabled) {
    return (
      <p className="rounded-lg border border-border/70 bg-surface-alt p-4 text-sm text-muted">
        This ticket is closed. Reopen it to add new comments.
      </p>
    )
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <textarea
        className="min-h-[100px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        placeholder="Write a reply..."
        disabled={isSubmitting}
        {...register('body')}
      />
      {errors.body && <p className="text-xs text-error">{errors.body.message}</p>}

      {isAdmin && (
        <label className="flex items-center gap-2 text-sm text-secondary">
          <input type="checkbox" className="rounded border-border" {...register('isInternal')} />
          Internal note (hidden from employee)
        </label>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Reply'}
      </Button>
    </form>
  )
}
