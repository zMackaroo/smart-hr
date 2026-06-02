import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { formatDate } from '../../../utils/date.utils'
import {
  CATEGORY_LABELS,
  type TicketDetail,
  type TicketPriority,
  type TicketStatus,
} from '../../../types/ticket.types'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { TicketStatusBadge } from './TicketStatusBadge'

interface TicketInfoPanelProps {
  ticket: TicketDetail
  isAdmin: boolean
  isSubmitting: boolean
  onUpdateStatus: (status: TicketStatus) => void
  onUpdatePriority: (priority: TicketPriority) => void
  onAssign: () => void
  onMarkResolved: () => void
  onCloseTicket: () => void
  onReopen: () => void
}

const STATUS_OPTIONS: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
const PRIORITY_OPTIONS: TicketPriority[] = ['low', 'medium', 'high', 'urgent']

export function TicketInfoPanel({
  ticket,
  isAdmin,
  isSubmitting,
  onUpdateStatus,
  onUpdatePriority,
  onAssign,
  onMarkResolved,
  onCloseTicket,
  onReopen,
}: TicketInfoPanelProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary">
        Ticket Info
      </h3>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Status</dt>
          <dd className="mt-1">
            {isAdmin ? (
              <PermissionGate
                module="tickets"
                action="edit"
                fallback={<TicketStatusBadge status={ticket.status} />}
              >
                <Select
                  value={ticket.status}
                  onChange={(v) => onUpdateStatus(v as TicketStatus)}
                  disabled={isSubmitting}
                  searchable={false}
                  options={STATUS_OPTIONS.map((s) => ({
                    value: s,
                    label: s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1),
                  }))}
                />
              </PermissionGate>
            ) : (
              <TicketStatusBadge status={ticket.status} />
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Priority</dt>
          <dd className="mt-1">
            {isAdmin ? (
              <PermissionGate
                module="tickets"
                action="edit"
                fallback={<TicketPriorityBadge priority={ticket.priority} />}
              >
                <Select
                  value={ticket.priority}
                  onChange={(v) => onUpdatePriority(v as TicketPriority)}
                  disabled={isSubmitting}
                  searchable={false}
                  options={PRIORITY_OPTIONS.map((p) => ({
                    value: p,
                    label: p.charAt(0).toUpperCase() + p.slice(1),
                  }))}
                />
              </PermissionGate>
            ) : (
              <TicketPriorityBadge priority={ticket.priority} />
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Category</dt>
          <dd className="mt-1 text-primary">{CATEGORY_LABELS[ticket.category]}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Assigned To</dt>
          <dd className="mt-1 text-primary">{ticket.assignedTo?.name ?? '—'}</dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Created</dt>
          <dd className="mt-1 text-primary">{formatDate(ticket.createdAt)}</dd>
        </div>

        {ticket.resolvedAt && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Resolved</dt>
            <dd className="mt-1 text-primary">{formatDate(ticket.resolvedAt)}</dd>
          </div>
        )}
      </dl>

      {isAdmin && (
        <PermissionGate module="tickets" action="edit">
          <div className="mt-6 space-y-2 border-t border-border/70 pt-4">
            <Button variant="outline" size="sm" className="w-full" onClick={onAssign}>
              Assign
            </Button>
            {(ticket.status === 'open' || ticket.status === 'in_progress') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={onMarkResolved}
              >
                Mark Resolved
              </Button>
            )}
            {ticket.status === 'resolved' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={onCloseTicket}
              >
                Close Ticket
              </Button>
            )}
            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
                onClick={onReopen}
              >
                Reopen
              </Button>
            )}
          </div>
        </PermissionGate>
      )}
    </div>
  )
}
