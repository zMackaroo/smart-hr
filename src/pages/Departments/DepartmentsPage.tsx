import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { UserAvatar } from '../../components/layout/UserAvatar'
import { formatDate } from '../../utils/date.utils'
import { DeleteDepartmentModal } from './components/DeleteDepartmentModal'
import { DepartmentFormModal } from './components/DepartmentFormModal'
import { useDepartmentsPageViewModel } from './DepartmentsPage.viewmodel'

export function DepartmentsPage() {
  const vm = useDepartmentsPageViewModel()

  return (
    <>
      <PageHeader
        title="Departments"
        breadcrumbs={[{ label: 'HR' }, { label: 'Departments' }]}
        actions={
          <PermissionGate module="departments" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search departments..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.filteredDepartments.length === 0 ? (
        <EmptyState
          title="No departments found"
          description={
            vm.searchQuery
              ? 'Try adjusting your search terms.'
              : 'Get started by adding your first department.'
          }
          icon={Building2}
          action={
            !vm.searchQuery ? (
              <PermissionGate module="departments" action="create">
                <Button onClick={vm.openAddModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </PermissionGate>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Department Name</th>
                <th className="px-5 py-3">Department Head</th>
                <th className="px-5 py-3">Total Employees</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-primary">{dept.name}</p>
                    {dept.description && (
                      <p className="text-xs text-secondary">{dept.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {dept.headEmployee ? (
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={dept.headEmployee.name}
                          avatarUrl={dept.headEmployee.avatarUrl}
                          size="sm"
                        />
                        <span className="text-sm text-primary">{dept.headEmployee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {dept.employeeCount}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {formatDate(dept.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <PermissionGate module="departments" action="edit">
                        <button
                          type="button"
                          onClick={() => vm.openEditModal(dept)}
                          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                          aria-label={`Edit ${dept.name}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </PermissionGate>
                      <PermissionGate module="departments" action="delete">
                        <button
                          type="button"
                          onClick={() => vm.openDeleteModal(dept)}
                          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-error"
                          aria-label={`Delete ${dept.name}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DepartmentFormModal
        isOpen={vm.isFormModalOpen}
        department={vm.selectedDepartment}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <DeleteDepartmentModal
        department={vm.selectedDepartment}
        isOpen={vm.isDeleteModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
      />
    </>
  )
}
