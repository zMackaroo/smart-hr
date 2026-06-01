import { Badge } from '../../../components/ui/Badge'
import type { ProjectStatus } from '../../../types/project.types'
import { PROJECT_STATUS_LABELS } from '../../../types/project.types'

const VARIANTS: Record<ProjectStatus, 'info' | 'success' | 'warning' | 'default' | 'error'> = {
  planning: 'default',
  active: 'success',
  on_hold: 'warning',
  completed: 'info',
  cancelled: 'error',
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge variant={VARIANTS[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
}
