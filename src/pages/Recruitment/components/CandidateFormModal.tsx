import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import {
  CandidateFormSchema,
  type Candidate,
  type CandidateFormInput,
  type CandidateStatus,
  type JobPosting,
} from '../../../types/recruitment.types'

interface CandidateFormModalProps {
  isOpen: boolean
  candidate: Candidate | null
  jobs: JobPosting[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: CandidateFormInput) => void
}

const STATUS_OPTIONS: CandidateStatus[] = [
  'new',
  'screening',
  'interview',
  'offered',
  'hired',
  'rejected',
]

export function CandidateFormModal({
  isOpen,
  candidate,
  jobs,
  isSubmitting,
  onClose,
  onSubmit,
}: CandidateFormModalProps) {
  const isEdit = Boolean(candidate)

  const form = useForm<CandidateFormInput>({
    resolver: zodResolver(CandidateFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      jobId: '',
      experienceYears: 0,
      currentCompany: '',
      notes: '',
      status: 'new',
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
    if (candidate) {
      reset({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone ?? '',
        jobId: candidate.job.id,
        experienceYears: candidate.experienceYears,
        currentCompany: candidate.currentCompany ?? '',
        notes: candidate.notes ?? '',
        status: candidate.status,
      })
    } else {
      reset({
        fullName: '',
        email: '',
        phone: '',
        jobId: jobs[0]?.id ?? '',
        experienceYears: 0,
        currentCompany: '',
        notes: '',
        status: 'new',
      })
    }
  }, [isOpen, candidate, jobs, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Candidate' : 'Add Candidate'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Candidate'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone (optional)" error={errors.phone?.message} {...register('phone')} />

        <Select
          label="Job"
          value={watch('jobId')}
          onChange={(v) => setValue('jobId', v, { shouldValidate: true })}
          error={errors.jobId?.message}
          placeholder="Select job"
          options={[
            { value: '', label: 'Select job' },
            ...jobs.map((j) => ({ value: j.id, label: j.title })),
          ]}
        />

        <Input
          label="Experience (years)"
          type="number"
          error={errors.experienceYears?.message}
          {...register('experienceYears', { valueAsNumber: true })}
        />

        <Input
          label="Current Company (optional)"
          error={errors.currentCompany?.message}
          {...register('currentCompany')}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Notes (optional)</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('notes')}
          />
        </div>

        {isEdit && (
          <Select
            label="Status"
            value={watch('status')}
            onChange={(v) => setValue('status', v as CandidateStatus, { shouldValidate: true })}
            searchable={false}
            options={STATUS_OPTIONS.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            }))}
          />
        )}
      </form>
    </Modal>
  )
}
