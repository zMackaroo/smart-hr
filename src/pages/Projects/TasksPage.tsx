import { Clock, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../components/shared/PermissionGate'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { LogTimeModal } from './components/LogTimeModal'
import { TaskStatusBadge } from './components/TaskStatusBadge'
import { TASK_STATUS_LABELS, type TaskStatus } from '../../types/project.types'
import { useTasksPageViewModel } from './TasksPage.viewmodel'

const STATUS_TABS: Array<{ label: string; value: TaskStatus | '' }> = [
  { label: 'All', value: '' },
  ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
    label,
    value: value as TaskStatus,
  })),
]

export function TasksPage() {
  const vm = useTasksPageViewModel()

  return (
    <>
      <PageHeader
        title={vm.isAdmin ? 'Tasks' : 'My Tasks'}
        breadcrumbs={[{ label: 'Projects' }, { label: vm.isAdmin ? 'All Tasks' : 'My Tasks' }]}
        actions={
          <PermissionGate module="projects" action="create">
            <Button onClick={vm.openLogModal} disabled={vm.assignableTasks.length === 0}>
              <Clock className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(event) => vm.setSearchQuery(event.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={vm.projectFilter}
          onChange={(event) => vm.setProjectFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="">All Projects</option>
          {vm.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
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
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              vm.statusFilter === tab.value ? 'bg-accent text-white' : 'bg-surface-alt text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Assignee</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Hours</th>
            </tr>
          </thead>
          <tbody>
            {vm.isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-secondary">
                  Loading tasks...
                </td>
              </tr>
            ) : vm.tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-secondary">
                  No tasks found.
                </td>
              </tr>
            ) : (
              vm.tasks.map((task) => (
                <tr key={task.id} className="border-t border-border/50">
                  <td className="px-5 py-3 font-medium text-primary">{task.title}</td>
                  <td className="px-5 py-3">
                    <Link to={`/projects/${task.projectId}`} className="text-sm text-accent hover:underline">
                      {task.projectName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.assignee?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.dueDate ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-secondary">{task.loggedHours}h</td>
                </tr>
              ))
            )}
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

      <LogTimeModal
        isOpen={vm.isLogModalOpen}
        tasks={vm.assignableTasks}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeLogModal}
        onSubmit={vm.onLogTime}
      />
    </>
  )
}
