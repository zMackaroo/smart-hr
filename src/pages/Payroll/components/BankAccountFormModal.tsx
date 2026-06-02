import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import {
  BankAccountFormSchema,
  ACCOUNT_TYPE_LABELS,
  type BankAccount,
  type BankAccountFormInput,
} from '../../../types/bank-account.types'

const BankAccountModalFormSchema = BankAccountFormSchema.extend({
  accountNumber: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending_verification']).optional(),
})

type ModalFormInput = z.infer<typeof BankAccountModalFormSchema>

interface BankAccountFormModalProps {
  isOpen: boolean
  account: BankAccount | null
  employees: Array<{ id: string; employeeId: string; fullName: string }>
  employeeId?: string
  isAdmin: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: BankAccountFormInput) => void
}

export function BankAccountFormModal({
  isOpen,
  account,
  employees,
  employeeId,
  isAdmin,
  isSubmitting,
  onClose,
  onSubmit,
}: BankAccountFormModalProps) {
  const isEdit = Boolean(account)

  const form = useForm<ModalFormInput>({
    resolver: zodResolver(BankAccountModalFormSchema),
    defaultValues: {
      employeeId: employeeId ?? '',
      accountHolderName: '',
      bankName: '',
      accountType: 'checking',
      accountNumber: '',
      routingNumber: '',
      isPrimary: false,
      status: 'active',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = form

  useEffect(() => {
    if (!isOpen) return
    if (account) {
      reset({
        employeeId: account.employee.id,
        accountHolderName: account.accountHolderName,
        bankName: account.bankName,
        accountType: account.accountType,
        accountNumber: '',
        routingNumber: account.routingNumber,
        isPrimary: account.isPrimary,
        status: account.status,
      })
    } else {
      reset({
        employeeId: employeeId ?? '',
        accountHolderName: '',
        bankName: '',
        accountType: 'checking',
        accountNumber: '',
        routingNumber: '',
        isPrimary: false,
        status: isAdmin ? 'active' : undefined,
      })
    }
  }, [isOpen, account, employeeId, isAdmin, reset])

  const submitHandler = (data: ModalFormInput) => {
    if (!isEdit && (!data.accountNumber || data.accountNumber.length < 4)) {
      setError('accountNumber', {
        message: 'Account number must be at least 4 digits',
      })
      return
    }

    if (isEdit && !data.accountNumber) {
      const { accountNumber: _removed, ...rest } = data
      onSubmit(rest as BankAccountFormInput)
      return
    }

    onSubmit(data as BankAccountFormInput)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Bank Account' : 'Add Bank Account'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submitHandler)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Account'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(submitHandler)}>
        {isAdmin && (
          <Select
            label="Employee"
            value={watch('employeeId')}
            onChange={(v) => setValue('employeeId', v, { shouldValidate: true })}
            error={errors.employeeId?.message}
            disabled={isEdit}
            placeholder="Select employee"
            options={[
              { value: '', label: 'Select employee' },
              ...employees.map((employee) => ({
                value: employee.id,
                label: `${employee.fullName} (${employee.employeeId})`,
              })),
            ]}
          />
        )}

        <Input
          label="Account Holder Name"
          error={errors.accountHolderName?.message}
          {...register('accountHolderName')}
        />

        <Input label="Bank Name" error={errors.bankName?.message} {...register('bankName')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Account Type"
            value={watch('accountType')}
            onChange={(v) => setValue('accountType', v as BankAccountFormInput['accountType'], { shouldValidate: true })}
            searchable={false}
            options={Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Input
            label={isEdit ? 'Account Number (leave blank to keep)' : 'Account Number'}
            type="password"
            autoComplete="off"
            error={errors.accountNumber?.message}
            {...register('accountNumber')}
          />
        </div>

        <Input
          label="Routing Number"
          maxLength={9}
          error={errors.routingNumber?.message}
          {...register('routingNumber')}
        />

        <label className="flex items-center gap-2 text-sm text-primary">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register('isPrimary')} />
          Set as primary payout account
        </label>

        {isAdmin && isEdit && (
          <Select
            label="Status"
            value={watch('status') ?? 'active'}
            onChange={(v) => setValue('status', v as NonNullable<ModalFormInput['status']>, { shouldValidate: true })}
            searchable={false}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending_verification', label: 'Pending Verification' },
            ]}
          />
        )}
      </form>
    </Modal>
  )
}
