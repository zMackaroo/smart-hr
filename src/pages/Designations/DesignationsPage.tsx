import { Briefcase, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatDate } from '../../utils/date.utils'
import { DeleteDesignationModal } from './components/DeleteDesignationModal'
import { DesignationFormModal } from './components/DesignationFormModal'
import { useDesignationsPageViewModel } from './DesignationsPage.viewmodel'

export function DesignationsPage() {
  const vm = useDesignationsPageViewModel()

  return (
    <>
      <PageHeader
        title="Designations"
        breadcrumbs={[{ label: 'HR' }, { label: 'Designations' }]}
        actions={
          <Button onClick={vm.openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Designation
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search designations..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <select
          value={vm.selectedDepartmentFilter}
          onChange={(e) => vm.setSelectedDepartmentFilter(e.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          <option value="">All Departments</option>
          {vm.departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.filteredDesignations.length === 0 ? (
        <EmptyState
          title="No designations found"
          description={
            vm.searchQuery || vm.selectedDepartmentFilter
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first designation.'
          }
          icon={Briefcase}
          action={
            !vm.searchQuery && !vm.selectedDepartmentFilter ? (
              <Button onClick={vm.openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add Designation
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Designation Name</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Total Employees</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.filteredDesignations.map((des) => (
                <tr
                  key={des.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-primary">{des.name}</td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {des.department?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {des.employeeCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {formatDate(des.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => vm.openEditModal(des)}
                        className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                        aria-label={`Edit ${des.name}`}
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => vm.openDeleteModal(des)}
                        className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-error"
                        aria-label={`Delete ${des.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DesignationFormModal
        isOpen={vm.isFormModalOpen}
        designation={vm.selectedDesignation}
        departments={vm.departments}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <DeleteDesignationModal
        designation={vm.selectedDesignation}
        isOpen={vm.isDeleteModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
      />
    </>
  )
}
