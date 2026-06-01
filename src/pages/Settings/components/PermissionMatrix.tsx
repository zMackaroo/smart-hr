import { Info } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import {
  ACTION_LABELS,
  isActionApplicable,
  MODULE_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionModule,
  type RolePermission,
} from '../../../types/permission.types'
import { PermissionToggleCell } from './PermissionToggleCell'

interface PermissionMatrixProps {
  roleName: string
  permissions: RolePermission[]
  isReadOnly: boolean
  isDirty: boolean
  isSubmitting: boolean
  onToggle: (module: PermissionModule, action: PermissionAction, value: boolean) => void
  onResetDefaults: () => void
  onSave: () => void
}

export function PermissionMatrix({
  roleName,
  permissions,
  isReadOnly,
  isDirty,
  isSubmitting,
  onToggle,
  onResetDefaults,
  onSave,
}: PermissionMatrixProps) {
  const permissionMap = new Map(permissions.map((entry) => [entry.module, entry.actions]))

  return (
    <div className="rounded-lg border border-border/70 bg-surface shadow-card">
      {isReadOnly && (
        <div className="border-b border-border/70 bg-[var(--state-info-bg)] px-4 py-3">
          <p className="text-sm text-info">
            Super Admin has full access. Permissions cannot be modified.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-surface-alt">
              <th className="sticky left-0 z-10 bg-surface-alt px-4 py-3 text-left font-medium text-primary">
                Module
              </th>
              {PERMISSION_ACTIONS.map((action) => (
                <th
                  key={action}
                  className="px-3 py-3 text-center font-medium text-primary"
                >
                  <span className="inline-flex items-center gap-1">
                    {ACTION_LABELS[action]}
                    {action === 'approve' && (
                      <span
                        title="Applies to leave requests, expense claims, support tickets, and referral reviews."
                        className="text-muted"
                      >
                        <Info className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">
                          Applies to leave requests, expense claims, support tickets, and referral
                          reviews.
                        </span>
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((module) => {
              const actions = permissionMap.get(module) ?? {
                view: false,
                create: false,
                edit: false,
                delete: false,
                approve: false,
              }

              return (
                <tr key={module} className="border-b border-border/50 last:border-b-0">
                  <td className="sticky left-0 z-10 bg-surface px-4 py-2 font-medium text-primary">
                    {MODULE_LABELS[module]}
                  </td>
                  {PERMISSION_ACTIONS.map((action) => {
                    const notApplicable = !isActionApplicable(module, action)
                    const checked = isReadOnly
                      ? !notApplicable
                      : (actions[action] ?? false)

                    return (
                      <td key={action} className="px-3 py-2">
                        <PermissionToggleCell
                          checked={checked}
                          notApplicable={notApplicable}
                          disabled={isReadOnly || notApplicable}
                          ariaLabel={`${roleName} ${MODULE_LABELS[module]} ${ACTION_LABELS[action]}`}
                          onChange={(value) => onToggle(module, action, value)}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!isReadOnly && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onResetDefaults}
            disabled={isSubmitting}
          >
            Reset to Defaults
          </Button>
          <Button type="button" onClick={onSave} disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      )}
    </div>
  )
}
