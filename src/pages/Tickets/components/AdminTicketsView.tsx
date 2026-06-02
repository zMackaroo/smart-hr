import { Search } from 'lucide-react'
import { EmptyState } from '../../../components/shared/EmptyState'
import { Select, selectTriggerClassName } from '../../../components/ui/Select'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { CATEGORY_LABELS, type TicketCategory, type TicketPriority, type TicketStatus } from '../../../types/ticket.types'
import { TicketSummaryCards } from './TicketSummaryCards'
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

  return (
    <>
      <TicketSummaryCards counts={vm.statusCounts} isLoading={vm.isLoading} />

      <div className="mb-6 rounded-lg border border-border/70 bg-surface p-4 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
          <div className="sm:col-span-2 xl:col-span-4">
            <label htmlFor="ticket-search" className="mb-1 block text-sm font-medium text-primary">
              Search
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                strokeWidth={1.5}
              />
              <input
                id="ticket-search"
                type="search"
                value={vm.searchQuery}
                onChange={(e) => vm.setSearchQuery(e.target.value)}
                placeholder="Subject, ticket #, or creator..."
                className={selectTriggerClassName + ' pl-9'}
              />
            </div>
          </div>

          <Select
            label="Status"
            value={vm.selectedStatus}
            onChange={(value) => vm.setSelectedStatus(value as TicketStatus | '')}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            searchable={false}
            className="xl:col-span-2"
          />

          <Select
            label="Priority"
            value={vm.selectedPriority}
            onChange={(value) => vm.setSelectedPriority(value as TicketPriority | '')}
            options={PRIORITY_OPTIONS}
            placeholder="All Priorities"
            searchable={false}
            className="xl:col-span-2"
          />

          <Select
            label="Category"
            value={vm.selectedCategory}
            onChange={(value) => vm.setSelectedCategory(value as TicketCategory | '')}
            options={CATEGORY_OPTIONS}
            placeholder="All Categories"
            className="xl:col-span-2"
          />

          <Select
            label="Assignee"
            value={vm.selectedAssignee}
            onChange={vm.setSelectedAssignee}
            options={[
              { value: '', label: 'All Assignees' },
              { value: '__unassigned__', label: 'Unassigned' },
              ...vm.assignees.map((assignee) => ({
                value: assignee.id,
                label: assignee.name,
              })),
            ]}
            placeholder="All Assignees"
            className="xl:col-span-2"
          />
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
