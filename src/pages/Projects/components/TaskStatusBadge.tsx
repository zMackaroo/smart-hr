import { Badge } from '../../../components/ui/Badge'
import type { TaskStatus } from '../../../types/project.types'
import { TASK_STATUS_LABELS } from '../../../types/project.types'

const VARIANTS: Record<TaskStatus, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
  todo: 'default',
  in_progress: 'info',
  done: 'success',
  blocked: 'error',
}

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return <Badge variant={VARIANTS[status]}>{TASK_STATUS_LABELS[status]}</Badge>
}
