import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { formatDate } from '../../../utils/date.utils'
import type { LeaveRequest } from '../../../types/leave.types'
import { LeaveStatusBadge } from './LeaveStatusBadge'

interface LeaveDetailModalProps {
  request: LeaveRequest | null
  isOpen: boolean
  onClose: () => void
}

export function LeaveDetailModal({ request, isOpen, onClose }: LeaveDetailModalProps) {
  if (!request) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Request Details"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-secondary">Status</span>
          <LeaveStatusBadge status={request.status} />
        </div>
        <DetailRow label="Employee" value={request.employee.name} />
        <DetailRow label="Department" value={request.employee.department} />
        <DetailRow
          label="Leave Type"
          value={
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: request.leaveType.color }}
              />
              {request.leaveType.name}
            </span>
          }
        />
        <DetailRow label="From" value={formatDate(request.fromDate)} />
        <DetailRow label="To" value={formatDate(request.toDate)} />
        <DetailRow label="Days" value={String(request.days)} />
        <DetailRow label="Applied On" value={formatDate(request.appliedOn)} />
        <DetailRow label="Reason" value={request.reason} />
        {request.approvedBy && (
          <DetailRow
            label="Approved By"
            value={`${request.approvedBy.name}${request.approvedOn ? ` on ${formatDate(request.approvedOn)}` : ''}`}
          />
        )}
        {request.rejectionReason && (
          <div className="rounded-md border border-error/30 bg-error/5 p-3">
            <p className="text-xs font-medium uppercase text-error">Rejection Reason</p>
            <p className="mt-1 text-primary">{request.rejectionReason}</p>
          </div>
        )}
        {request.documentUrl && (
          <DetailRow
            label="Document"
            value={
              <a href={request.documentUrl} className="text-accent hover:underline">
                View attachment
              </a>
            }
          />
        )}
      </div>
    </Modal>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0">
      <span className="shrink-0 text-secondary">{label}</span>
      <span className="text-right font-medium text-primary">{value}</span>
    </div>
  )
}
