import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
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
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Department</label>
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('departmentId')}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-xs text-error">{errors.departmentId.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Designation</label>
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('designationId')}
              >
                <option value="">Select designation</option>
                {filteredDesignations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.designationId && (
                <p className="mt-1 text-xs text-error">{errors.designationId.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Role</label>
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('role')}
              >
                <option value="employee">Employee</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Reporting Manager</label>
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                {...register('managerId')}
              >
                <option value="">None</option>
                {managers
                  .filter((m) => m.id !== employee?.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}
      </form>
    </Modal>
  )
}
