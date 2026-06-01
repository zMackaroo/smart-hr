import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { formatDate, formatRelativeTime } from '../../../utils/date.utils'
import { CATEGORY_LABELS, type Ticket } from '../../../types/ticket.types'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { TicketStatusBadge } from './TicketStatusBadge'

interface TicketTableRowProps {
  ticket: Ticket
  showCreator?: boolean
  showAssignee?: boolean
  showCreated?: boolean
}

function truncateSubject(subject: string, max = 60): string {
  return subject.length > max ? `${subject.slice(0, max)}…` : subject
}

export function TicketTableRow({
  ticket,
  showCreator = false,
  showAssignee = false,
  showCreated = false,
}: TicketTableRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-alt/50">
      <td className="px-5 py-3.5">
        <span className="font-mono text-sm font-medium text-accent">{ticket.ticketNumber}</span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-sm text-primary" title={ticket.subject}>
          {truncateSubject(ticket.subject)}
        </span>
      </td>
      {showCreator && (
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <UserAvatar
              name={ticket.createdBy.name}
              avatarUrl={ticket.createdBy.avatarUrl}
              size="sm"
            />
            <span className="text-sm text-primary">{ticket.createdBy.name}</span>
          </div>
        </td>
      )}
      <td className="px-5 py-3.5 text-sm text-secondary">{CATEGORY_LABELS[ticket.category]}</td>
      <td className="px-5 py-3.5">
        <TicketPriorityBadge priority={ticket.priority} />
      </td>
      <td className="px-5 py-3.5">
        <TicketStatusBadge status={ticket.status} />
      </td>
      {showAssignee && (
        <td className="px-5 py-3.5 text-sm text-secondary">
          {ticket.assignedTo?.name ?? '—'}
        </td>
      )}
      {showCreated && (
        <td className="px-5 py-3.5 text-sm text-secondary">{formatDate(ticket.createdAt)}</td>
      )}
      <td className="px-5 py-3.5 text-sm text-secondary">
        {formatRelativeTime(ticket.lastActivityAt)}
      </td>
      <td className="px-5 py-3.5">
        <Link
          to={`/tickets/${ticket.id}`}
          className="inline-flex rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          aria-label={`View ${ticket.ticketNumber}`}
        >
          <Eye className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  )
}
