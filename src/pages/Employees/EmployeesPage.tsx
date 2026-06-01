import { LayoutGrid, List, Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { cn } from '../../utils/cn'
import { AddEditEmployeeModal } from './components/AddEditEmployeeModal'
import { DeleteEmployeeModal } from './components/DeleteEmployeeModal'
import { EmployeeCard } from './components/EmployeeCard'
import { EmployeeFilters } from './components/EmployeeFilters'
import { EmployeePagination } from './components/EmployeePagination'
import { EmployeeTableRow } from './components/EmployeeTableRow'
import { useEmployeesPageViewModel } from './EmployeesPage.viewmodel'

export function EmployeesPage() {
  const vm = useEmployeesPageViewModel()

  return (
    <>
      <PageHeader
        title="Employees"
        breadcrumbs={[{ label: 'HR' }, { label: 'Employees' }]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex rounded-md border border-border p-0.5">
              <button
                type="button"
                onClick={() => vm.setViewMode('grid')}
                className={cn(
                  'rounded p-2 transition-colors',
                  vm.viewMode === 'grid'
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:text-primary',
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => vm.setViewMode('list')}
                className={cn(
                  'rounded p-2 transition-colors',
                  vm.viewMode === 'list'
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:text-primary',
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        }
      />

      <EmployeeFilters
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        selectedDepartment={vm.selectedDepartment}
        onDepartmentChange={vm.setSelectedDepartment}
        selectedStatus={vm.selectedStatus}
        onStatusChange={vm.setSelectedStatus}
        departments={vm.departments}
        showing={vm.employees.length}
        total={vm.total}
      />

      {vm.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {vm.employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={vm.openEditModal}
              onDelete={vm.openDeleteModal}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Join Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.employees.map((employee, index) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  index={vm.start + index}
                  onEdit={vm.openEditModal}
                  onDelete={vm.openDeleteModal}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EmployeePagination
        page={vm.page}
        totalPages={vm.totalPages}
        start={vm.start}
        end={vm.end}
        total={vm.total}
        onPageChange={vm.onPageChange}
      />

      <AddEditEmployeeModal
        isOpen={vm.isAddEditModalOpen}
        employee={vm.selectedEmployee}
        departments={vm.departments}
        designations={vm.designations}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmitAddEdit}
      />

      <DeleteEmployeeModal
        employee={vm.selectedEmployee}
        isOpen={vm.isDeleteModalOpen}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
      />
    </>
  )
}
