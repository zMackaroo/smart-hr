import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getEmployeePickerOptions } from '../../../api/employees.api'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import {
  DepartmentFormSchema,
  type Department,
  type DepartmentFormInput,
} from '../../../types/department.types'

interface DepartmentFormModalProps {
  isOpen: boolean
  department: Department | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: DepartmentFormInput) => void
}

export function DepartmentFormModal({
  isOpen,
  department,
  isSubmitting,
  onClose,
  onSubmit,
}: DepartmentFormModalProps) {
  const [headSearch, setHeadSearch] = useState('')
  const employees = getEmployeePickerOptions()

  const form = useForm<DepartmentFormInput>({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      headEmployeeId: '',
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

  const headEmployeeId = watch('headEmployeeId')

  useEffect(() => {
    if (!isOpen) return
    setHeadSearch('')
    if (department) {
      reset({
        name: department.name,
        description: department.description ?? '',
        headEmployeeId: department.headEmployee?.id ?? '',
      })
    } else {
      reset({ name: '', description: '', headEmployeeId: '' })
    }
  }, [isOpen, department, reset])

  const filteredEmployees = useMemo(() => {
    if (!headSearch.trim()) return employees
    const q = headSearch.toLowerCase()
    return employees.filter((e) => e.name.toLowerCase().includes(q))
  }, [employees, headSearch])

  const selectedHead = employees.find((e) => e.id === headEmployeeId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? 'Edit Department' : 'Add Department'}
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
        <Input label="Department Name" error={errors.name?.message} {...register('name')} />
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('description')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">
            Department Head (optional)
          </label>
          {selectedHead && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surface-alt px-3 py-2">
              <UserAvatar name={selectedHead.name} avatarUrl={selectedHead.avatarUrl} size="sm" />
              <span className="flex-1 text-sm text-primary">{selectedHead.name}</span>
              <button
                type="button"
                onClick={() => setValue('headEmployeeId', '')}
                className="text-xs text-secondary hover:text-error"
              >
                Clear
              </button>
            </div>
          )}
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={headSearch}
              onChange={(e) => setHeadSearch(e.target.value)}
              placeholder="Search employees..."
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            />
          </div>
          <Select
            value={headEmployeeId ?? ''}
            onChange={(v) => setValue('headEmployeeId', v, { shouldValidate: true })}
            placeholder="No department head"
            options={[
              { value: '', label: 'No department head' },
              ...filteredEmployees.map((emp) => ({ value: emp.id, label: emp.name })),
            ]}
          />
        </div>
      </form>
    </Modal>
  )
}
