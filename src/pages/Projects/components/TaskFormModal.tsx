import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import {
  TaskFormSchema,
  TASK_STATUS_LABELS,
  type Task,
  type TaskFormInput,
  type TaskStatus,
} from '../../../types/project.types'

interface TaskFormModalProps {
  isOpen: boolean
  task: Task | null
  projects: Array<{ id: string; name: string }>
  employees: Array<{ id: string; name: string }>
  defaultProjectId?: string
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: TaskFormInput) => void
}

export function TaskFormModal({
  isOpen,
  task,
  projects,
  employees,
  defaultProjectId,
  isSubmitting,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const form = useForm<TaskFormInput>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      projectId: defaultProjectId ?? projects[0]?.id ?? '',
      title: '',
      description: '',
      assigneeId: '',
      status: 'todo',
      dueDate: '',
    },
  })

  const { register, handleSubmit, reset } = form

  useEffect(() => {
    if (!isOpen) return

    if (task) {
      reset({
        projectId: task.projectId,
        title: task.title,
        description: task.description ?? '',
        assigneeId: task.assignee?.id ?? '',
        status: task.status,
        dueDate: task.dueDate ?? '',
      })
    } else {
      reset({
        projectId: defaultProjectId ?? projects[0]?.id ?? '',
        title: '',
        description: '',
        assigneeId: '',
        status: 'todo',
        dueDate: '',
      })
    }
  }, [isOpen, task, reset, projects, defaultProjectId])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add Task'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Project</label>
          <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" {...register('projectId')}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <Input label="Title" {...register('title')} />
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            {...register('description')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Assignee</label>
          <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" {...register('assigneeId')}>
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Status</label>
            <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" {...register('status')}>
              {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <Input label="Due Date" type="date" {...register('dueDate')} />
        </div>
      </form>
    </Modal>
  )
}
