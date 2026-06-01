import { Search } from 'lucide-react'
import { EmptyState } from '../../../components/shared/EmptyState'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { CATEGORY_LABELS, type TicketCategory, type TicketPriority, type TicketStatus } from '../../../types/ticket.types'
import { TicketTableRow } from './TicketTableRow'
import { useAdminTicketsViewModel } from './AdminTicketsView.viewmodel'

const STATUS_OPTIONS: Array<{ label: string; value: TicketStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

const PRIORITY_OPTIONS: Array<{ label: string; value: TicketPriority | '' }> = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const CATEGORY_OPTIONS: Array<{ label: string; value: TicketCategory | '' }> = [
  { label: 'All Categories', value: '' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    label,
    value: value as TicketCategory,
  })),
]

export function AdminTicketsView() {
  const vm = useAdminTicketsViewModel()

  const selectClass =
    'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  const summaryCards = [
    { label: 'Open', count: vm.statusCounts.open, className: 'text-info' },
    { label: 'In Progress', count: vm.statusCounts.inProgress, className: 'text-warning' },
    { label: 'Resolved', count: vm.statusCounts.resolved, className: 'text-success' },
    { label: 'Closed', count: vm.statusCounts.closed, className: 'text-muted' },
  ]

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border/70 bg-surface p-4 shadow-card"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${card.className}`}>{card.count}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search subject, ticket #, or creator..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={vm.selectedStatus}
            onChange={(e) => vm.setSelectedStatus(e.target.value as TicketStatus | '')}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={vm.selectedPriority}
            onChange={(e) => vm.setSelectedPriority(e.target.value as TicketPriority | '')}
            className={selectClass}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={vm.selectedCategory}
            onChange={(e) => vm.setSelectedCategory(e.target.value as TicketCategory | '')}
            className={selectClass}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={vm.selectedAssignee}
            onChange={(e) => vm.setSelectedAssignee(e.target.value)}
            className={selectClass}
          >
            <option value="">All Assignees</option>
            <option value="__unassigned__">Unassigned</option>
            {vm.assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.tickets.length === 0 ? (
        <EmptyState title="No tickets found" description="Try adjusting your filters." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Created By</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned To</th>
                  <th className="px-5 py-3">Last Activity</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.tickets.map((ticket) => (
                  <TicketTableRow
                    key={ticket.id}
                    ticket={ticket}
                    showCreator
                    showAssignee
                  />
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
    </>
  )
}
