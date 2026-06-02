import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getDesignationOptions } from '../../../api/org-data'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import type { Department } from '../../../types/department.types'
import {
  JobFormSchema,
  EMPLOYMENT_TYPE_LABELS,
  type JobFormInput,
  type JobPosting,
} from '../../../types/recruitment.types'

interface JobFormModalProps {
  isOpen: boolean
  job: JobPosting | null
  departments: Department[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: JobFormInput) => void
}

export function JobFormModal({
  isOpen,
  job,
  departments,
  isSubmitting,
  onClose,
  onSubmit,
}: JobFormModalProps) {
  const form = useForm<JobFormInput>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      title: '',
      departmentId: '',
      designationId: '',
      location: '',
      employmentType: 'full_time',
      experienceLevel: '',
      salaryMin: undefined,
      salaryMax: undefined,
      description: '',
      requirements: '',
      status: 'draft',
      openings: 1,
      closingDate: '',
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
  const designations = useMemo(
    () =>
      getDesignationOptions().filter(
        (d) => !departmentId || d.departmentId === departmentId,
      ),
    [departmentId],
  )

  useEffect(() => {
    if (!isOpen) return
    if (job) {
      reset({
        title: job.title,
        departmentId: job.department.id,
        designationId: job.designation?.id ?? '',
        location: job.location,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryRange?.min,
        salaryMax: job.salaryRange?.max,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        openings: job.openings,
        closingDate: job.closingDate ?? '',
      })
    } else {
      reset({
        title: '',
        departmentId: '',
        designationId: '',
        location: '',
        employmentType: 'full_time',
        experienceLevel: '',
        salaryMin: undefined,
        salaryMax: undefined,
        description: '',
        requirements: '',
        status: 'draft',
        openings: 1,
        closingDate: '',
      })
    }
  }, [isOpen, job, reset])

  useEffect(() => {
    if (!departmentId) return
    const currentDes = watch('designationId')
    if (currentDes && !designations.some((d) => d.id === currentDes)) {
      setValue('designationId', '')
    }
  }, [departmentId, designations, setValue, watch])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? 'Edit Job Posting' : 'Post Job'}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : job ? 'Update Job' : 'Post Job'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Job Title"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>

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
          label="Designation (optional)"
          value={watch('designationId') ?? ''}
          onChange={(v) => setValue('designationId', v, { shouldValidate: true })}
          placeholder="Select designation"
          options={[
            { value: '', label: 'Select designation' },
            ...designations.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />

        <div>
          <Input label="Location" error={errors.location?.message} {...register('location')} />
        </div>

        <Select
          label="Employment Type"
          value={watch('employmentType')}
          onChange={(v) => setValue('employmentType', v as JobFormInput['employmentType'], { shouldValidate: true })}
          searchable={false}
          options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />

        <div>
          <Input
            label="Experience Level"
            placeholder="e.g. 1–3 years"
            error={errors.experienceLevel?.message}
            {...register('experienceLevel')}
          />
        </div>

        <div>
          <Input
            label="Salary Min (optional)"
            type="number"
            error={errors.salaryMin?.message}
            {...register('salaryMin', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Input
            label="Salary Max (optional)"
            type="number"
            error={errors.salaryMax?.message}
            {...register('salaryMax', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Input
            label="Number of Openings"
            type="number"
            error={errors.openings?.message}
            {...register('openings', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Input
            label="Closing Date (optional)"
            type="date"
            error={errors.closingDate?.message}
            {...register('closingDate')}
          />
        </div>

        <Select
          label="Status"
          value={watch('status')}
          onChange={(v) => setValue('status', v as JobFormInput['status'], { shouldValidate: true })}
          searchable={false}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ]}
        />

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error">{errors.description.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-primary">Requirements</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('requirements')}
          />
          {errors.requirements && (
            <p className="mt-1 text-xs text-error">{errors.requirements.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
