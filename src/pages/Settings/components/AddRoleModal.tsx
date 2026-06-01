import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { CreateRoleSchema, type CreateRoleInput, type Role } from '../../../types/permission.types'

interface AddRoleModalProps {
  isOpen: boolean
  roles: Role[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: CreateRoleInput) => void
}

export function AddRoleModal({
  isOpen,
  roles,
  isSubmitting,
  onClose,
  onSubmit,
}: AddRoleModalProps) {
  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      cloneFromRoleId: roles[0]?.id ?? '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const handleClose = () => {
    reset({
      name: '',
      description: '',
      cloneFromRoleId: roles.find((role) => role.slug === 'hr_admin')?.id ?? roles[0]?.id ?? '',
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Custom Role"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Role'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Role Name"
          placeholder="Payroll Manager"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Description"
          placeholder="Optional description"
          error={errors.description?.message}
          {...register('description')}
        />

        <div>
          <label htmlFor="clone-from-role" className="mb-1 block text-sm font-medium text-primary">
            Clone permissions from
          </label>
          <select
            id="clone-from-role"
            className="h-10 w-full rounded border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            {...register('cloneFromRoleId')}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.cloneFromRoleId?.message && (
            <p className="mt-1 text-xs text-error">{errors.cloneFromRoleId.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
