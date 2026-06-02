import { Copy, Plus } from 'lucide-react'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { AddRoleModal } from './components/AddRoleModal'
import { PermissionMatrix } from './components/PermissionMatrix'
import { RoleListPanel } from './components/RoleListPanel'
import { useRolesPermissionsPageViewModel } from './RolesPermissionsPage.viewmodel'

export function RolesPermissionsPage() {
  const vm = useRolesPermissionsPageViewModel()

  if (vm.isLoading) {
    return (
      <>
        <PageHeader
          title="Roles & Permissions"
          breadcrumbs={[{ label: 'Settings' }, { label: 'Roles & Permissions' }]}
        />
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg bg-surface-alt" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-surface-alt" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        breadcrumbs={[{ label: 'Settings' }, { label: 'Roles & Permissions' }]}
        actions={
          <Button onClick={vm.openAddRoleModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        }
      />

      <div className="mb-4 lg:hidden">
        <Select
          id="role-select"
          label="Role"
          value={vm.selectedRoleId}
          onChange={vm.setSelectedRoleId}
          options={vm.roles.map((role) => ({ value: role.id, label: role.name }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="hidden lg:block">
          <RoleListPanel
            roles={vm.roles}
            selectedRoleId={vm.selectedRoleId}
            onSelect={vm.setSelectedRoleId}
            onDelete={vm.openDeleteRoleModal}
          />
        </div>

        {vm.selectedRole ? (
          <div className="space-y-4">
            {!vm.selectedRole.isSystem && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={vm.onDuplicateRole}
                  disabled={vm.isSubmitting}
                >
                  <Copy className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Duplicate role
                </Button>
              </div>
            )}

            <PermissionMatrix
              roleName={vm.selectedRole.name}
              permissions={vm.draftPermissions}
              isReadOnly={vm.isReadOnly}
              isDirty={vm.isDirty}
              isSubmitting={vm.isSubmitting}
              onToggle={vm.onToggle}
              onResetDefaults={vm.onResetDefaults}
              onSave={vm.onSave}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-border/70 bg-surface p-6">
            <p className="text-sm text-secondary">Select a role to manage permissions.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={vm.showDiscardDialog}
        onClose={vm.cancelDiscard}
        onConfirm={vm.confirmDiscard}
        title="Discard unsaved changes?"
        message="You have unsaved permission changes. Switching roles will discard them."
        confirmLabel="Discard changes"
        destructive
      />

      <ConfirmDialog
        isOpen={Boolean(vm.roleToDelete)}
        onClose={vm.closeDeleteRoleModal}
        onConfirm={vm.onConfirmDeleteRole}
        title="Delete custom role?"
        message={
          vm.roleToDelete
            ? `Delete "${vm.roleToDelete.name}"? This cannot be undone.${
                vm.roleToDelete.userCount > 0
                  ? ` ${vm.roleToDelete.userCount} user(s) are still assigned to this role.`
                  : ''
              }`
            : ''
        }
        confirmLabel="Delete role"
        destructive
      />

      <AddRoleModal
        isOpen={vm.showAddRoleModal}
        roles={vm.roles}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeAddRoleModal}
        onSubmit={vm.onCreateRole}
      />
    </>
  )
}
