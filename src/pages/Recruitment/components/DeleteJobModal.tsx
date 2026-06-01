import { AlertTriangle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import type { JobPosting } from '../../../types/recruitment.types'

interface DeleteJobModalProps {
  job: JobPosting | null
  isOpen: boolean
  hasCandidates: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteJobModal({
  job,
  isOpen,
  hasCandidates,
  isSubmitting,
  onClose,
  onConfirm,
}: DeleteJobModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Job Posting"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting || hasCandidates}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      }
    >
      {job && (
        <div className="space-y-3">
          <p className="text-sm text-secondary">
            Are you sure you want to delete <strong>{job.title}</strong>?
          </p>
          {hasCandidates && (
            <div className="flex items-start gap-2 rounded-md bg-[var(--state-warning-bg)] p-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This job has {job.applicantsCount} linked candidate
                {job.applicantsCount === 1 ? '' : 's'} and cannot be deleted.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
