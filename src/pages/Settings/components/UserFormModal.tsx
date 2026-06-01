import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  UserFormSchema,
  type PlatformUser,
  type UserFormInput,
} from '../../../types/user.types'
import type { Role } from '../../../types/permission.types'
import { resolveUserFormRoleId } from '../../../utils/role-assignment.utils'

interface UserFormModalProps {
  isOpen: boolean
  user: PlatformUser | null
  roles: Role[]
  employees: Array<{ id: string; name: string; employeeId: string }>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: UserFormInput) => void
}

export function UserFormModal({
  isOpen,
  user,
  roles,
  employees,
  isSubmitting,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = Boolean(user)

  const form = useForm<UserFormInput>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: roles[0]?.id ?? '',
      employeeId: '',
      sendInvite: true,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  useEffect(() => {
    if (!isOpen) return

    const defaultRoleId =
      roles.find((role) => role.slug === 'employee')?.id ?? roles[0]?.id ?? ''

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        roleId: resolveUserFormRoleId(user),
        employeeId: user.employee?.id ?? '',
        sendInvite: false,
      })
    } else {
      reset({
        name: '',
        email: '',
        roleId: defaultRoleId,
        employeeId: '',
        sendInvite: true,
      })
    }
  }, [isOpen, user, reset, roles])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add User'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name" error={errors.name?.message} {...register('name')} />

        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          disabled={isEdit}
          {...register('email')}
        />

        <div>
          <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-primary">
            Role
          </label>
          <select
            id="user-role"
            className="h-10 w-full rounded border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            {...register('roleId')}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {!role.isSystem ? ' (Custom)' : ''}
              </option>
            ))}
          </select>
          {errors.roleId?.message && (
            <p className="mt-1 text-xs text-error">{errors.roleId.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="user-employee-link"
            className="mb-1 block text-sm font-medium text-primary"
          >
            Link to Employee
          </label>
          <select
            id="user-employee-link"
            className="h-10 w-full rounded border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            {...register('employeeId')}
          >
            <option value="">None</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} ({employee.employeeId})
              </option>
            ))}
          </select>
        </div>

        {!isEdit && (
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              {...register('sendInvite')}
            />
            Send invite email
          </label>
        )}
      </form>
    </Modal>
  )
}
