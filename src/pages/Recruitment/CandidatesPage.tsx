import { Plus, Search, Users } from 'lucide-react'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/shared/EmptyState'
import { Select } from '../../components/ui/Select'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { CandidateCard } from './components/CandidateCard'
import { CandidateDetailModal } from './components/CandidateDetailModal'
import { CandidateFormModal } from './components/CandidateFormModal'
import { useCandidatesPageViewModel } from './CandidatesPage.viewmodel'
import type { CandidateStatus } from '../../types/recruitment.types'

const STATUS_OPTIONS: Array<{ label: string; value: CandidateStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'Screening', value: 'screening' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offered', value: 'offered' },
  { label: 'Hired', value: 'hired' },
  { label: 'Rejected', value: 'rejected' },
]

export function CandidatesPage() {
  const vm = useCandidatesPageViewModel()

  return (
    <>
      <PageHeader
        title="Candidates"
        breadcrumbs={[{ label: 'Recruitment' }, { label: 'Candidates' }]}
        actions={
          <PermissionGate module="recruitment" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>

        <Select
          value={vm.selectedJob}
          onChange={vm.setSelectedJob}
          placeholder="All Jobs"
          className="lg:w-52"
          options={[
            { value: '', label: 'All Jobs' },
            ...vm.jobs.map((j) => ({ value: j.id, label: j.title })),
          ]}
        />

        <Select
          value={vm.selectedStatus}
          onChange={(value) => vm.setSelectedStatus(value as CandidateStatus | '')}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          searchable={false}
          className="lg:w-44"
        />
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Add a candidate or adjust your filters."
          icon={Users}
          action={
            <PermissionGate module="recruitment" action="create">
              <Button onClick={vm.openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vm.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onView={vm.openDetailModal}
                onEdit={vm.openEditModal}
                onAdvanceStatus={vm.onAdvanceStatus}
              />
            ))}
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

      <CandidateFormModal
        isOpen={vm.isFormModalOpen}
        candidate={vm.selectedCandidate}
        jobs={vm.jobs.filter((j) => j.status === 'open')}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <CandidateDetailModal
        candidate={vm.selectedCandidate}
        isOpen={vm.isDetailModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onUpdateStatus={vm.onUpdateStatus}
      />
    </>
  )
}
