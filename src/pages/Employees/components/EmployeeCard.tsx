import { Mail, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import type { Employee } from '../../../types/employee.types'

interface EmployeeCardProps {
  employee: Employee
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border/70 bg-surface p-6 text-center shadow-card">
      <UserAvatar name={employee.fullName} avatarUrl={employee.avatarUrl} seed={employee.id} size="lg" />
      <h3 className="mt-4 text-base font-semibold text-primary">{employee.fullName}</h3>
      <p className="mt-1 text-sm text-secondary">{employee.designation.name}</p>
      <Badge variant="info" className="mt-3">
        {employee.department.name}
      </Badge>
      <div className="mt-3">
        <StatusBadge status={employee.status} />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <a
          href={`mailto:${employee.email}`}
          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          aria-label={`Email ${employee.fullName}`}
        >
          <Mail className="h-4 w-4" strokeWidth={1.5} />
        </a>
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          aria-label={`Edit ${employee.fullName}`}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(employee)}
          className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-error"
          aria-label={`Delete ${employee.fullName}`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <Link
          to={`/employees/${employee.id}`}
          className="ml-1 text-xs font-medium text-accent hover:text-accent-dark"
        >
          View
        </Link>
      </div>
    </div>
  )
}
