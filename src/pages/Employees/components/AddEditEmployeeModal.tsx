import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { getManagerOptions } from '../../../api/employees.api'
import { EmployeeFormSchema, type Employee, type EmployeeFormInput } from '../../../types/employee.types'
import type { DepartmentOption, DesignationOption } from '../../../types/employee.types'
import { cn } from '../../../utils/cn'

interface AddEditEmployeeModalProps {
  isOpen: boolean
  employee: Employee | null
  departments: DepartmentOption[]
  designations: DesignationOption[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: EmployeeFormInput) => void
}

const TABS = ['Basic Info', 'Work Details'] as const

export function AddEditEmployeeModal({
  isOpen,
  employee,
  departments,
  designations,
  isSubmitting,
  onClose,
  onSubmit,
}: AddEditEmployeeModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Basic Info')
  const managers = getManagerOptions()

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(EmployeeFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      designationId: '',
      role: 'employee',
      joinDate: '',
      location: '',
      managerId: '',
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

  const departmentId = watch('departmentId')

  useEffect(() => {
    if (!isOpen) return
    setActiveTab('Basic Info')
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone ?? '',
        departmentId: employee.department.id,
        designationId: employee.designation.id,
        role: employee.role === 'super_admin' ? 'employee' : employee.role,
        joinDate: employee.joinDate,
        location: employee.location ?? '',
        managerId: employee.managerId ?? '',
      })
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        designationId: '',
        role: 'employee',
        joinDate: new Date().toISOString().split('T')[0],
        location: '',
        managerId: '',
      })
    }
  }, [isOpen, employee, reset])

  const filteredDesignations = designations.filter(
    (d) => !departmentId || d.departmentId === departmentId,
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add Employee'}
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
      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-b-2 border-accent text-accent'
                : 'text-secondary hover:text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="space-y-4">
        {activeTab === 'Basic Info' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
            <Input label="Join Date" type="date" error={errors.joinDate?.message} {...register('joinDate')} />
            <Input label="Location" error={errors.location?.message} {...register('location')} />
          </>
        )}

        {activeTab === 'Work Details' && (
          <>
            <Select
              label="Department"
              value={watch('departmentId')}
              onChange={(v) => setValue('departmentId', v, { shouldValidate: true })}
              error={errors.departmentId?.message}
              placeholder="Select department"
              options={[
                { value: '', label: 'Select department' },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            <Select
              label="Designation"
              value={watch('designationId')}
              onChange={(v) => setValue('designationId', v, { shouldValidate: true })}
              error={errors.designationId?.message}
              placeholder="Select designation"
              options={[
                { value: '', label: 'Select designation' },
                ...filteredDesignations.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            <Select
              label="Role"
              value={watch('role')}
              onChange={(v) => setValue('role', v as EmployeeFormInput['role'], { shouldValidate: true })}
              searchable={false}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'hr_admin', label: 'HR Admin' },
              ]}
            />
            <Select
              label="Reporting Manager"
              value={watch('managerId') ?? ''}
              onChange={(v) => setValue('managerId', v, { shouldValidate: true })}
              placeholder="None"
              options={[
                { value: '', label: 'None' },
                ...managers
                  .filter((m) => m.id !== employee?.id)
                  .map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
          </>
        )}
      </form>
    </Modal>
  )
}
