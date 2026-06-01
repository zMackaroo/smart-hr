import { Trash2 } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { cn } from '../../../utils/cn'
import type { Role } from '../../../types/permission.types'

interface RoleListPanelProps {
  roles: Role[]
  selectedRoleId: string
  onSelect: (roleId: string) => void
  onDelete?: (role: Role) => void
}

export function RoleListPanel({
  roles,
  selectedRoleId,
  onSelect,
  onDelete,
}: RoleListPanelProps) {
  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const isSelected = role.id === selectedRoleId

        return (
          <div
            key={role.id}
            className={cn(
              'w-full rounded-lg border bg-surface transition-colors',
              isSelected
                ? 'border-accent shadow-sm'
                : 'border-border/70 hover:border-accent/40 hover:bg-surface-alt',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(role.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-primary">{role.name}</p>
                    <Badge variant={role.isSystem ? 'info' : 'default'}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-secondary">{role.description}</p>
                </div>
                <Badge variant="default">{role.userCount}</Badge>
              </div>
            </button>

            {!role.isSystem && onDelete && (
              <div className="border-t border-border/50 px-4 py-2">
                <button
                  type="button"
                  onClick={() => onDelete(role)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-error transition-colors hover:text-error/80"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Delete role
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
