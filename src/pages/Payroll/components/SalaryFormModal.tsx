import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { previewSalary } from '../../../api/payroll.api'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  PAY_FREQUENCY_LABELS,
  SalaryFormSchema,
  type EmployeeSalary,
  type SalaryFormInput,
} from '../../../types/payroll.types'
import { SalaryBreakdownPanel } from './SalaryBreakdownPanel'

interface SalaryFormModalProps {
  isOpen: boolean
  salary: EmployeeSalary | null
  availableEmployees: Array<{ id: string; employeeId: string; fullName: string }>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: SalaryFormInput) => void
}

export function SalaryFormModal({
  isOpen,
  salary,
  availableEmployees,
  isSubmitting,
  onClose,
  onSubmit,
}: SalaryFormModalProps) {
  const form = useForm<SalaryFormInput>({
    resolver: zodResolver(SalaryFormSchema),
    defaultValues: {
      employeeId: '',
      baseSalary: 0,
      payFrequency: 'monthly',
      effectiveFrom: '',
      bankAccountLast4: '',
      components: [],
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

  const components = watch('components') ?? []
  const baseSalary = watch('baseSalary')
  const payFrequency = watch('payFrequency')
  const effectiveFrom = watch('effectiveFrom')
  const bankAccountLast4 = watch('bankAccountLast4')
  const employeeId = watch('employeeId')

  const preview = useMemo(
    () =>
      previewSalary({
        employeeId: employeeId || 'preview',
        baseSalary: Number(baseSalary) || 0,
        payFrequency,
        effectiveFrom: effectiveFrom || '2026-01-01',
        bankAccountLast4,
        components,
      }),
    [employeeId, baseSalary, payFrequency, effectiveFrom, bankAccountLast4, components],
  )

  useEffect(() => {
    if (!isOpen) return
    if (salary) {
      reset({
        employeeId: salary.employee.id,
        baseSalary: salary.baseSalary,
        payFrequency: salary.payFrequency,
        effectiveFrom: salary.effectiveFrom,
        bankAccountLast4: salary.bankAccountLast4 ?? '',
        components: salary.components.map(({ label, amount, type }) => ({
          label,
          amount,
          type,
        })),
      })
    } else {
      reset({
        employeeId: '',
        baseSalary: 50000,
        payFrequency: 'monthly',
        effectiveFrom: new Date().toISOString().split('T')[0],
        bankAccountLast4: '',
        components: [
          { label: 'Housing Allowance', amount: 500, type: 'earning' },
          { label: 'Income Tax', amount: 6000, type: 'deduction' },
        ],
      })
    }
  }, [isOpen, salary, reset])

  const earnings = components
    .map((c, index) => ({ ...c, index }))
    .filter((c) => c.type === 'earning')
  const deductions = components
    .map((c, index) => ({ ...c, index }))
    .filter((c) => c.type === 'deduction')

  const addComponent = (type: 'earning' | 'deduction') => {
    setValue('components', [...components, { label: '', amount: 0, type }])
  }

  const removeComponent = (index: number) => {
    setValue(
      'components',
      components.filter((_, i) => i !== index),
    )
  }

  const updateComponent = (
    index: number,
    field: 'label' | 'amount',
    value: string | number,
  ) => {
    const next = [...components]
    next[index] = { ...next[index], [field]: value }
    setValue('components', next)
  }

  const employeeOptions = salary
    ? [
        {
          id: salary.employee.id,
          employeeId: salary.employee.employeeId,
          fullName: salary.employee.name,
        },
        ...availableEmployees,
      ]
    : availableEmployees

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={salary ? 'Edit Salary' : 'Add Salary'}
      className="max-w-2xl"
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
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Employee</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm disabled:bg-surface-alt"
            disabled={Boolean(salary)}
            {...register('employeeId')}
          >
            <option value="">Select employee</option>
            {employeeOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} ({e.employeeId})
              </option>
            ))}
          </select>
          {errors.employeeId && (
            <p className="mt-1 text-xs text-error">{errors.employeeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Base Salary"
            type="number"
            min={0}
            error={errors.baseSalary?.message}
            {...register('baseSalary', { valueAsNumber: true })}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Pay Frequency</label>
            <select
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
              {...register('payFrequency')}
            >
              {(Object.keys(PAY_FREQUENCY_LABELS) as Array<keyof typeof PAY_FREQUENCY_LABELS>).map(
                (key) => (
                  <option key={key} value={key}>
                    {PAY_FREQUENCY_LABELS[key]}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Effective From"
            type="date"
            error={errors.effectiveFrom?.message}
            {...register('effectiveFrom')}
          />
          <Input
            label="Bank Account Last 4"
            maxLength={4}
            error={errors.bankAccountLast4?.message}
            {...register('bankAccountLast4')}
          />
        </div>

        <ComponentSection
          title="Earnings"
          items={earnings}
          onAdd={() => addComponent('earning')}
          onRemove={removeComponent}
          onUpdate={updateComponent}
        />
        <ComponentSection
          title="Deductions"
          items={deductions}
          onAdd={() => addComponent('deduction')}
          onRemove={removeComponent}
          onUpdate={updateComponent}
        />

        <SalaryBreakdownPanel {...preview} />
      </form>
    </Modal>
  )
}

function ComponentSection({
  title,
  items,
  onAdd,
  onRemove,
  onUpdate,
}: {
  title: string
  items: Array<{ label: string; amount: number; type: 'earning' | 'deduction'; index: number }>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: 'label' | 'amount', value: string | number) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-3 w-3" /> Add {title.slice(0, -1)}
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-secondary">No {title.toLowerCase()} added</p>
        )}
        {items.map((item) => (
          <div key={item.index} className="flex items-center gap-2">
            <input
              className="h-10 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
              placeholder="Label"
              value={item.label}
              onChange={(e) => onUpdate(item.index, 'label', e.target.value)}
            />
            <input
              type="number"
              min={0}
              className="h-10 w-28 rounded-md border border-border bg-surface px-3 text-sm"
              placeholder="Amount"
              value={item.amount}
              onChange={(e) => onUpdate(item.index, 'amount', Number(e.target.value))}
            />
            <button
              type="button"
              onClick={() => onRemove(item.index)}
              className="rounded-md p-2 text-secondary hover:text-error"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
