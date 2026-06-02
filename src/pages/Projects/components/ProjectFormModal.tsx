import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import {
  ProjectFormSchema,
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectFormInput,
  type ProjectStatus,
} from '../../../types/project.types'

interface ProjectFormModalProps {
  isOpen: boolean
  project: Project | null
  employees: Array<{ id: string; name: string }>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormInput) => void
}

export function ProjectFormModal({
  isOpen,
  project,
  employees,
  isSubmitting,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      ownerId: '',
      memberIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
  })

  const { register, handleSubmit, reset, watch, setValue } = form
  const memberIds = watch('memberIds')

  useEffect(() => {
    if (!isOpen) return

    if (project) {
      reset({
        name: project.name,
        description: project.description,
        status: project.status,
        ownerId: project.owner.id,
        memberIds: project.members.map((member) => member.id),
        startDate: project.startDate,
        endDate: project.endDate ?? '',
      })
    } else {
      reset({
        name: '',
        description: '',
        status: 'planning',
        ownerId: employees[0]?.id ?? '',
        memberIds: employees[0] ? [employees[0].id] : [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      })
    }
  }, [isOpen, project, reset, employees])

  const toggleMember = (id: string) => {
    const next = memberIds.includes(id) ? memberIds.filter((item) => item !== id) : [...memberIds, id]
    setValue('memberIds', next, { shouldValidate: true })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create Project'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Project Name" {...register('name')} />
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Description</label>
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            {...register('description')}
          />
        </div>
        <Select
          label="Status"
          value={watch('status')}
          onChange={(v) => setValue('status', v as ProjectStatus, { shouldValidate: true })}
          searchable={false}
          options={(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((status) => ({
            value: status,
            label: PROJECT_STATUS_LABELS[status],
          }))}
        />
        <Select
          label="Owner"
          value={watch('ownerId')}
          onChange={(v) => setValue('ownerId', v, { shouldValidate: true })}
          options={employees.map((employee) => ({
            value: employee.id,
            label: employee.name,
          }))}
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">Members</label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-3">
            {employees.map((employee) => (
              <label key={employee.id} className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={memberIds.includes(employee.id)}
                  onChange={() => toggleMember(employee.id)}
                />
                {employee.name}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" {...register('startDate')} />
          <Input label="End Date" type="date" {...register('endDate')} />
        </div>
      </form>
    </Modal>
  )
}
