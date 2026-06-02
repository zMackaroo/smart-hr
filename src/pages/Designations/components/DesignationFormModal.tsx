import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
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
    watch,
    setValue,
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
        <Select
          label="Department (optional)"
          value={watch('departmentId') ?? ''}
          onChange={(v) => setValue('departmentId', v, { shouldValidate: true })}
          placeholder="No department"
          options={[
            { value: '', label: 'No department' },
            ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
          ]}
        />
      </form>
    </Modal>
  )
}
