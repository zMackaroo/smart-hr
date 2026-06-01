import { Briefcase, Plus, Search } from 'lucide-react'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/shared/EmptyState'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { DeleteJobModal } from './components/DeleteJobModal'
import { JobCard } from './components/JobCard'
import { JobFormModal } from './components/JobFormModal'
import { useJobsPageViewModel } from './JobsPage.viewmodel'
import type { JobStatus } from '../../types/recruitment.types'

const STATUS_TABS: Array<{ label: string; value: JobStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

export function JobsPage() {
  const vm = useJobsPageViewModel()

  const selectClass =
    'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  return (
    <>
      <PageHeader
        title="Jobs"
        breadcrumbs={[{ label: 'Recruitment' }, { label: 'Jobs' }]}
        actions={
          <PermissionGate module="recruitment" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search by title or location..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>

        <select
          value={vm.selectedDepartment}
          onChange={(e) => vm.setSelectedDepartment(e.target.value)}
          className={selectClass}
        >
          <option value="">All Departments</option>
          {vm.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.jobs.length === 0 ? (
        <EmptyState
          title="No job postings found"
          description="Create a new job posting to start recruiting."
          icon={Briefcase}
          action={
            <PermissionGate module="recruitment" action="create">
              <Button onClick={vm.openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </PermissionGate>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vm.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                canDelete={job.applicantsCount === 0}
                onEdit={vm.openEditModal}
                onDelete={vm.openDeleteModal}
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

      <JobFormModal
        isOpen={vm.isFormModalOpen}
        job={vm.selectedJob}
        departments={vm.departments}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <DeleteJobModal
        job={vm.selectedJob}
        isOpen={vm.isDeleteModalOpen}
        hasCandidates={vm.jobHasCandidates}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
      />
    </>
  )
}
