import { Calendar, Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { Button } from '../../../components/ui/Button'
import type { Project } from '../../../types/project.types'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Link to={`/projects/${project.id}`} className="text-base font-semibold text-primary hover:text-accent">
            {project.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-secondary">{project.description}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-auto space-y-2 text-sm text-secondary">
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4" strokeWidth={1.5} />
          {project.members.length} member{project.members.length === 1 ? '' : 's'} · Owner: {project.owner.name}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4" strokeWidth={1.5} />
          {project.startDate}
          {project.endDate ? ` → ${project.endDate}` : ''}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          {project.taskCount} tasks · {project.loggedHours}h logged
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-border bg-surface px-3 text-xs font-medium text-primary hover:bg-surface-alt"
        >
          View
        </Link>
        <PermissionGate module="projects" action="edit">
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            Edit
          </Button>
        </PermissionGate>
        <PermissionGate module="projects" action="delete">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project)}
            disabled={project.taskCount > 0}
          >
            Delete
          </Button>
        </PermissionGate>
      </div>
    </div>
  )
}
