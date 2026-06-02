import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import {
  ReferralFormSchema,
  type JobPosting,
  type ReferralFormInput,
} from '../../../types/recruitment.types'

interface ReferralFormModalProps {
  isOpen: boolean
  jobs: JobPosting[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: ReferralFormInput) => void
}

export function ReferralFormModal({
  isOpen,
  jobs,
  isSubmitting,
  onClose,
  onSubmit,
}: ReferralFormModalProps) {
  const form = useForm<ReferralFormInput>({
    resolver: zodResolver(ReferralFormSchema),
    defaultValues: {
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      jobId: '',
      relationship: '',
      notes: '',
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
    reset({
      candidateName: '',
      candidateEmail: '',
      candidatePhone: '',
      jobId: jobs[0]?.id ?? '',
      relationship: '',
      notes: '',
    })
  }, [isOpen, jobs, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Referral"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Referral'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Input
          label="Candidate Name"
          error={errors.candidateName?.message}
          {...register('candidateName')}
        />
        <Input
          label="Candidate Email"
          type="email"
          error={errors.candidateEmail?.message}
          {...register('candidateEmail')}
        />
        <Input
          label="Candidate Phone (optional)"
          error={errors.candidatePhone?.message}
          {...register('candidatePhone')}
        />

        <Select
          label="Job"
          value={watch('jobId')}
          onChange={(v) => setValue('jobId', v, { shouldValidate: true })}
          error={errors.jobId?.message}
          placeholder="Select open job"
          options={[
            { value: '', label: 'Select open job' },
            ...jobs.map((j) => ({ value: j.id, label: j.title })),
          ]}
        />

        <Input
          label="Relationship"
          placeholder="e.g. Former colleague"
          error={errors.relationship?.message}
          {...register('relationship')}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Notes (optional)</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  )
}
