import { ExternalLink } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatDate } from '../../../utils/date.utils'
import type { Candidate, CandidateStatus } from '../../../types/recruitment.types'
import { CandidateStatusBadge } from './CandidateStatusBadge'

interface CandidateDetailModalProps {
  candidate: Candidate | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status: CandidateStatus) => void
}

const STATUS_OPTIONS: CandidateStatus[] = [
  'new',
  'screening',
  'interview',
  'offered',
  'hired',
  'rejected',
]

const SOURCE_LABELS = {
  direct: 'Direct',
  referral: 'Referral',
  job_board: 'Job Board',
} as const

export function CandidateDetailModal({
  candidate,
  isOpen,
  isSubmitting,
  onClose,
  onUpdateStatus,
}: CandidateDetailModalProps) {
  if (!candidate) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Profile"
      className="max-w-2xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={candidate.fullName}
            avatarUrl={candidate.avatarUrl}
            size="lg"
          />
          <div>
            <h3 className="text-lg font-semibold text-primary">{candidate.fullName}</h3>
            <p className="text-sm text-secondary">{candidate.email}</p>
            {candidate.phone && <p className="text-sm text-secondary">{candidate.phone}</p>}
            <div className="mt-2">
              <CandidateStatusBadge status={candidate.status} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Applied For</p>
            <p className="mt-1 text-sm text-primary">{candidate.job.title}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Applied Date</p>
            <p className="mt-1 text-sm text-primary">{formatDate(candidate.appliedDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Experience</p>
            <p className="mt-1 text-sm text-primary">{candidate.experienceYears} years</p>
          </div>
          {candidate.currentCompany && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Current Company
              </p>
              <p className="mt-1 text-sm text-primary">{candidate.currentCompany}</p>
            </div>
          )}
          {candidate.rating && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Rating</p>
              <p className="mt-1 text-sm text-accent">
                {'★'.repeat(candidate.rating)}
                {'☆'.repeat(5 - candidate.rating)}
              </p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Source</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="default">{SOURCE_LABELS[candidate.source]}</Badge>
            {candidate.referredBy && (
              <span className="text-sm text-secondary">
                Referred by {candidate.referredBy.name}
              </span>
            )}
          </div>
        </div>

        {candidate.notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Notes</p>
            <p className="mt-1 text-sm text-secondary">{candidate.notes}</p>
          </div>
        )}

        {candidate.resumeUrl && (
          <a
            href={candidate.resumeUrl}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View Resume
          </a>
        )}

        <Select
          label="Update Status"
          value={candidate.status}
          onChange={(v) => onUpdateStatus(candidate.id, v as CandidateStatus)}
          disabled={isSubmitting}
          searchable={false}
          options={STATUS_OPTIONS.map((s) => ({
            value: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
          }))}
        />
      </div>
    </Modal>
  )
}
