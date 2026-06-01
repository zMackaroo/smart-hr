import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { formatDate } from '../../../utils/date.utils'
import type { Employee } from '../../../types/employee.types'

interface EmployeeTableRowProps {
  employee: Employee
  index: number
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeeTableRow({ employee, index, onEdit, onDelete }: EmployeeTableRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-alt/50">
      <td className="px-5 py-3.5 text-sm text-secondary">{index}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <UserAvatar name={employee.fullName} avatarUrl={employee.avatarUrl} seed={employee.id} size="sm" />
          <div>
            <p className="text-sm font-medium text-primary">{employee.fullName}</p>
            <p className="text-xs text-secondary">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-secondary">{employee.department.name}</td>
      <td className="px-5 py-3.5 text-sm text-secondary">{employee.designation.name}</td>
      <td className="px-5 py-3.5 text-sm text-secondary">{formatDate(employee.joinDate)}</td>
      <td className="px-5 py-3.5">
        <StatusBadge status={employee.status} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          <Link
            to={`/employees/${employee.id}`}
            className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
            aria-label={`View ${employee.fullName}`}
          >
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <PermissionGate module="employees" action="edit">
            <button
              type="button"
              onClick={() => onEdit(employee)}
              className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
              aria-label={`Edit ${employee.fullName}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </PermissionGate>
          <PermissionGate module="employees" action="delete">
            <button
              type="button"
              onClick={() => onDelete(employee)}
              className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-error"
              aria-label={`Delete ${employee.fullName}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  )
}
