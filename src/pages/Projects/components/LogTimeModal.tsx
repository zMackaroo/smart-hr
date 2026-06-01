import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { TimeLogFormSchema, type Task, type TimeLogFormInput } from '../../../types/project.types'

interface LogTimeModalProps {
  isOpen: boolean
  tasks: Task[]
  defaultTaskId?: string
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: TimeLogFormInput) => void
}

export function LogTimeModal({
  isOpen,
  tasks,
  defaultTaskId,
  isSubmitting,
  onClose,
  onSubmit,
}: LogTimeModalProps) {
  const form = useForm<TimeLogFormInput>({
    resolver: zodResolver(TimeLogFormSchema),
    defaultValues: {
      taskId: defaultTaskId ?? tasks[0]?.id ?? '',
      date: new Date().toISOString().split('T')[0],
      hours: 1,
      notes: '',
    },
  })

  const { register, handleSubmit, reset } = form

  useEffect(() => {
    if (!isOpen) return
    reset({
      taskId: defaultTaskId ?? tasks[0]?.id ?? '',
      date: new Date().toISOString().split('T')[0],
      hours: 1,
      notes: '',
    })
  }, [isOpen, defaultTaskId, tasks, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Time"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting || tasks.length === 0}>
            {isSubmitting ? 'Saving...' : 'Log Time'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Task</label>
          <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm" {...register('taskId')}>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.projectName} — {task.title}
              </option>
            ))}
          </select>
        </div>
        <Input label="Date" type="date" {...register('date')} />
        <Input label="Hours" type="number" step="0.25" min="0.25" max="24" {...register('hours', { valueAsNumber: true })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-primary">Notes</label>
          <textarea
            className="min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  )
}
