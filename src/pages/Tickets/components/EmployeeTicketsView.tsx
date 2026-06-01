import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/shared/EmptyState'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import type { TicketStatus } from '../../../types/ticket.types'
import { CreateTicketModal } from './CreateTicketModal'
import { TicketTableRow } from './TicketTableRow'
import { useEmployeeTicketsViewModel } from './EmployeeTicketsView.viewmodel'

const STATUS_TABS: Array<{ label: string; value: TicketStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

export function EmployeeTicketsView() {
  const vm = useEmployeeTicketsViewModel()

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={vm.openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => vm.setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              vm.statusFilter === tab.value
                ? 'bg-accent text-white'
                : 'bg-surface-alt text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="Create a new ticket to get support from HR."
          action={
            <Button onClick={vm.openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.tickets.map((ticket) => (
                  <TicketTableRow key={ticket.id} ticket={ticket} showCreated />
                ))}
              </tbody>
            </table>
          </div>
          <EmployeePagination
            page={vm.page}
            totalPages={vm.totalPages}
            start={vm.start}
            end={vm.end}
            total={vm.total}
            onPageChange={vm.onPageChange}
          />
        </>
      )}

      <CreateTicketModal
        isOpen={vm.isCreateModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeCreateModal}
        onSubmit={vm.onSubmitCreate}
      />
    </>
  )
}
