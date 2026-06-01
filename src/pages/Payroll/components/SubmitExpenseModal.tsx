import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  EXPENSE_CATEGORIES,
  SubmitExpenseFormSchema,
  CATEGORY_LABELS,
  type SubmitExpenseFormInput,
} from '../../../types/expense.types'

interface SubmitExpenseModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: SubmitExpenseFormInput) => void
}

export function SubmitExpenseModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: SubmitExpenseModalProps) {
  const form = useForm<SubmitExpenseFormInput>({
    resolver: zodResolver(SubmitExpenseFormSchema),
    defaultValues: {
      category: 'travel',
      title: '',
      description: '',
      amount: 0,
      expenseDate: '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form

  useEffect(() => {
    if (!isOpen) return
    reset({
      category: 'travel',
      title: '',
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
    })
  }, [isOpen, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Expense Claim"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Title" error={errors.title?.message} {...register('title')} />

        <div>
          <label htmlFor="expense-category" className="mb-1 block text-sm font-medium text-primary">
            Category
          </label>
          <select
            id="expense-category"
            className="h-10 w-full rounded border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            {...register('category')}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Expense Date"
          type="date"
          error={errors.expenseDate?.message}
          {...register('expenseDate')}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            placeholder="Optional details about this expense..."
            {...register('description')}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Receipt (optional)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            className="block w-full text-sm text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-alt file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setValue('receipt', file, { shouldValidate: true })
            }}
          />
        </div>
      </form>
    </Modal>
  )
}
