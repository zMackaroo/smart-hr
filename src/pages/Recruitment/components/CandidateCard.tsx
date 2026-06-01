import { ArrowRight, Eye, Pencil } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatDate } from '../../../utils/date.utils'
import { getNextCandidateStatus, type Candidate } from '../../../types/recruitment.types'
import { CandidateStatusBadge } from './CandidateStatusBadge'

interface CandidateCardProps {
  candidate: Candidate
  onView: (candidate: Candidate) => void
  onEdit: (candidate: Candidate) => void
  onAdvanceStatus: (id: string) => void
}

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <span className="text-sm text-accent">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
}

export function CandidateCard({
  candidate,
  onView,
  onEdit,
  onAdvanceStatus,
}: CandidateCardProps) {
  const canAdvance = getNextCandidateStatus(candidate.status) !== null

  return (
    <div className="flex flex-col rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <UserAvatar
          name={candidate.fullName}
          avatarUrl={candidate.avatarUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-primary">{candidate.fullName}</h3>
          <p className="truncate text-sm text-secondary">{candidate.email}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-secondary">
          Applied for: <span className="text-primary">{candidate.job.title}</span>
        </p>
        <div className="flex items-center gap-2 text-secondary">
          <StarRating rating={candidate.rating} />
          {candidate.rating && <span>·</span>}
          <span>{candidate.experienceYears} yrs exp</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <CandidateStatusBadge status={candidate.status} />
        <span className="text-xs text-muted">{formatDate(candidate.appliedDate)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
        <Button variant="outline" size="sm" onClick={() => onView(candidate)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(candidate)}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        {canAdvance && (
          <Button variant="outline" size="sm" onClick={() => onAdvanceStatus(candidate.id)}>
            <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
            Next Stage
          </Button>
        )}
      </div>
    </div>
  )
}
