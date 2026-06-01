import { FolderKanban, Plus, Search } from 'lucide-react'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { ProjectCard } from './components/ProjectCard'
import { ProjectFormModal } from './components/ProjectFormModal'
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../../types/project.types'
import { useProjectsPageViewModel } from './ProjectsPage.viewmodel'

const STATUS_TABS: Array<{ label: string; value: ProjectStatus | '' }> = [
  { label: 'All', value: '' },
  ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
    label,
    value: value as ProjectStatus,
  })),
]

export function ProjectsPage() {
  const vm = useProjectsPageViewModel()

  return (
    <>
      <PageHeader
        title={vm.isAdmin ? 'Projects' : 'My Projects'}
        breadcrumbs={[{ label: 'Projects' }, { label: vm.isAdmin ? 'All Projects' : 'My Projects' }]}
        actions={
          <PermissionGate module="projects" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(event) => vm.setSearchQuery(event.target.value)}
            placeholder="Search projects..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => vm.setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              vm.statusFilter === tab.value ? 'bg-accent text-white' : 'bg-surface-alt text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : vm.projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create a project to start tracking tasks and time."
          icon={FolderKanban}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vm.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
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

      <ProjectFormModal
        isOpen={vm.modalMode === 'add' || vm.modalMode === 'edit'}
        project={vm.modalMode === 'edit' ? vm.selectedProject : null}
        employees={vm.employees}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        isOpen={vm.modalMode === 'delete'}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
        title="Delete project?"
        message={
          vm.selectedProject
            ? `Delete "${vm.selectedProject.name}"? Projects with tasks cannot be deleted.`
            : ''
        }
        confirmLabel="Delete project"
        destructive
      />
    </>
  )
}
