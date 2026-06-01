import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import type { Department } from '../../../types/department.types'
import {
  DesignationFormSchema,
  type Designation,
  type DesignationFormInput,
} from '../../../types/designation.types'

interface DesignationFormModalProps {
  isOpen: boolean
  designation: Designation | null
  departments: Department[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: DesignationFormInput) => void
}

export function DesignationFormModal({
  isOpen,
  designation,
  departments,
  isSubmitting,
  onClose,
  onSubmit,
}: DesignationFormModalProps) {
  const form = useForm<DesignationFormInput>({
    resolver: zodResolver(DesignationFormSchema),
    defaultValues: {
      name: '',
      departmentId: '',
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
    if (designation) {
      reset({
        name: designation.name,
        departmentId: designation.department?.id ?? '',
      })
    } else {
      reset({ name: '', departmentId: '' })
    }
  }, [isOpen, designation, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={designation ? 'Edit Designation' : 'Add Designation'}
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
        <Input label="Designation Name" error={errors.name?.message} {...register('name')} />
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Department (optional)</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            {...register('departmentId')}
          >
            <option value="">No department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}
