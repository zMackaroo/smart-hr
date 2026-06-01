import { Pencil, Trash2 } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDate } from '../../../utils/date.utils'
import { formatCurrency } from '../../../utils/currency.utils'
import { cn } from '../../../utils/cn'
import {
  EMPLOYMENT_TYPE_LABELS,
  type JobPosting,
  type JobStatus,
} from '../../../types/recruitment.types'

interface JobCardProps {
  job: JobPosting
  canDelete: boolean
  onEdit: (job: JobPosting) => void
  onDelete: (job: JobPosting) => void
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface-alt text-muted' },
  open: { label: 'Open', className: 'bg-[var(--state-success-bg)] text-success' },
  closed: { label: 'Closed', className: 'bg-[var(--state-error-bg)] text-error' },
}

export function JobCard({ job, canDelete, onEdit, onDelete }: JobCardProps) {
  const status = statusConfig[job.status]

  return (
    <div className="flex flex-col rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">{job.title}</h3>
        <Badge variant="default" className={cn('shrink-0', status.className)}>
          {status.label}
        </Badge>
      </div>

      <p className="text-sm text-secondary">
        {job.department.name} · {job.location}
      </p>
      <p className="mt-1 text-sm text-secondary">
        {EMPLOYMENT_TYPE_LABELS[job.employmentType]} · {job.experienceLevel}
      </p>

      {job.salaryRange && (
        <p className="mt-2 text-sm font-medium text-primary">
          {formatCurrency(job.salaryRange.min)} – {formatCurrency(job.salaryRange.max)}
        </p>
      )}

      <div className="mt-4 flex-1 space-y-1 text-sm text-secondary">
        <p>
          {job.openings} opening{job.openings === 1 ? '' : 's'} · {job.applicantsCount}{' '}
          applicant{job.applicantsCount === 1 ? '' : 's'}
        </p>
        {job.postedDate && <p>Posted: {formatDate(job.postedDate)}</p>}
      </div>

      <div className="mt-4 flex gap-2 border-t border-border/70 pt-4">
        <PermissionGate module="recruitment" action="edit">
          <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </PermissionGate>
        <PermissionGate module="recruitment" action="delete">
          <Button
            variant="outline"
            size="sm"
            disabled={!canDelete}
            title={!canDelete ? 'Cannot delete job with linked candidates' : undefined}
            onClick={() => onDelete(job)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
