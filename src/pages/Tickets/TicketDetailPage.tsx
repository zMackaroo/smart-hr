import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader'
import { UserAvatar } from '../../components/layout/UserAvatar'
import { formatDate } from '../../utils/date.utils'
import { AssignTicketModal } from './components/AssignTicketModal'
import { TicketCommentForm } from './components/TicketCommentForm'
import { TicketCommentThread } from './components/TicketCommentThread'
import { TicketInfoPanel } from './components/TicketInfoPanel'
import { TicketPriorityBadge } from './components/TicketPriorityBadge'
import { TicketStatusBadge } from './components/TicketStatusBadge'
import { useTicketDetailPageViewModel } from './TicketDetailPage.viewmodel'

export function TicketDetailPage() {
  const vm = useTicketDetailPageViewModel()

  if (vm.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-alt" />
        <div className="h-40 animate-pulse rounded-lg bg-surface-alt" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-lg bg-surface-alt lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-lg bg-surface-alt" />
        </div>
      </div>
    )
  }

  if (!vm.ticket) {
    return (
      <div className="py-12 text-center">
        <p className="text-secondary">Ticket not found.</p>
        <Link to="/tickets" className="mt-4 inline-flex text-sm text-accent hover:underline">
          Back to tickets
        </Link>
      </div>
    )
  }

  const { ticket } = vm

  return (
    <>
      <div className="mb-4">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>
      </div>

      <PageHeader
        title={`${ticket.ticketNumber} · ${ticket.subject}`}
        breadcrumbs={[
          { label: 'Support' },
          { label: 'Tickets', href: '/tickets' },
          { label: ticket.ticketNumber },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TicketStatusBadge status={ticket.status} />
        <TicketPriorityBadge priority={ticket.priority} />
        <div className="flex items-center gap-2 text-sm text-secondary">
          <UserAvatar
            name={ticket.createdBy.name}
            avatarUrl={ticket.createdBy.avatarUrl}
            size="sm"
          />
          <span>
            Created by {ticket.createdBy.name} · {formatDate(ticket.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm text-primary">{ticket.description}</p>
          </section>

          <section className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary">
              Comments ({ticket.comments.length})
            </h2>
            <TicketCommentThread comments={ticket.comments} isAdmin={vm.isAdmin} />
            <div className="mt-6 border-t border-border/70 pt-6">
              <TicketCommentForm
                isAdmin={vm.isAdmin}
                isDisabled={ticket.status === 'closed'}
                isSubmitting={vm.isSubmittingComment}
                onSubmit={vm.onSubmitComment}
              />
            </div>
          </section>
        </div>

        <div>
          <TicketInfoPanel
            ticket={ticket}
            isAdmin={vm.isAdmin}
            isSubmitting={vm.isSubmitting}
            onUpdateStatus={vm.onUpdateStatus}
            onUpdatePriority={vm.onUpdatePriority}
            onAssign={vm.openAssignModal}
            onMarkResolved={vm.onMarkResolved}
            onCloseTicket={vm.onCloseTicket}
            onReopen={vm.onReopen}
          />
        </div>
      </div>

      {vm.isAdmin && (
        <AssignTicketModal
          isOpen={vm.isAssignModalOpen}
          isSubmitting={vm.isSubmitting}
          assignees={vm.assignees}
          currentAssigneeId={ticket.assignedTo?.id}
          onClose={vm.closeAssignModal}
          onConfirm={vm.onAssign}
        />
      )}
    </>
  )
}
