import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { ProjectStatusBadge } from './components/ProjectStatusBadge'
import { TaskFormModal } from './components/TaskFormModal'
import { TaskStatusBadge } from './components/TaskStatusBadge'
import { useProjectDetailPageViewModel } from './ProjectDetailPage.viewmodel'

export function ProjectDetailPage() {
  const vm = useProjectDetailPageViewModel()

  if (vm.isLoading || !vm.project) {
    return (
      <>
        <PageHeader title="Project" breadcrumbs={[{ label: 'Projects' }, { label: 'Loading...' }]} />
        <div className="h-64 animate-pulse rounded-lg bg-surface-alt" />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={vm.project.name}
        breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: vm.project.name }]}
        actions={
          <PermissionGate module="projects" action="create">
            <Button onClick={vm.openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </PermissionGate>
        }
      />

      <Link to="/projects" className="mb-4 inline-flex items-center gap-2 text-sm text-secondary hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="mb-6 rounded-lg border border-border/70 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <ProjectStatusBadge status={vm.project.status} />
            <p className="mt-3 max-w-3xl text-sm text-secondary">{vm.project.description}</p>
          </div>
          <div className="text-sm text-secondary">
            <p>Owner: {vm.project.owner.name}</p>
            <p className="mt-1">
              {vm.project.startDate}
              {vm.project.endDate ? ` → ${vm.project.endDate}` : ''}
            </p>
            <p className="mt-1">
              {vm.project.taskCount} tasks · {vm.project.loggedHours}h logged
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {vm.project.members.map((member) => (
            <span key={member.id} className="rounded-full bg-surface-alt px-3 py-1 text-xs text-secondary">
              {member.name}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Assignee</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Hours</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vm.tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-secondary">
                  No tasks yet.
                </td>
              </tr>
            ) : (
              vm.tasks.map((task) => (
                <tr key={task.id} className="border-t border-border/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-primary">{task.title}</p>
                    {task.description && <p className="text-xs text-secondary">{task.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.assignee?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.dueDate ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.loggedHours}h</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <PermissionGate module="projects" action="edit">
                        <Button variant="outline" size="sm" onClick={() => vm.openEditModal(task)}>
                          Edit
                        </Button>
                      </PermissionGate>
                      <PermissionGate module="projects" action="delete">
                        <Button variant="outline" size="sm" onClick={() => vm.openDeleteModal(task)}>
                          Delete
                        </Button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TaskFormModal
        isOpen={vm.modalMode === 'add' || vm.modalMode === 'edit'}
        task={vm.modalMode === 'edit' ? vm.selectedTask : null}
        projects={vm.projects}
        employees={vm.employees}
        defaultProjectId={vm.project.id}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        isOpen={vm.modalMode === 'delete'}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDelete}
        title="Delete task?"
        message={vm.selectedTask ? `Delete "${vm.selectedTask.title}"?` : ''}
        confirmLabel="Delete task"
        destructive
      />
    </>
  )
}
