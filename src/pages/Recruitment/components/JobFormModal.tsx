import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { getDesignationOptions } from '../../../api/org-data'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
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

  const selectClass =
    'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

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

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Department</label>
          <select className={selectClass} {...register('departmentId')}>
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
          <label className="mb-1 block text-sm font-medium text-primary">
            Designation (optional)
          </label>
          <select className={selectClass} {...register('designationId')}>
            <option value="">Select designation</option>
            {designations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input label="Location" error={errors.location?.message} {...register('location')} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Employment Type</label>
          <select className={selectClass} {...register('employmentType')}>
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Status</label>
          <select className={selectClass} {...register('status')}>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

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
