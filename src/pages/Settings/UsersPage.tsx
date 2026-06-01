import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/PageHeader'
import { EmployeePagination } from '../Employees/components/EmployeePagination'
import { DeactivateUserModal } from './components/DeactivateUserModal'
import { UserFilters } from './components/UserFilters'
import { UserFormModal } from './components/UserFormModal'
import { UserTableRow } from './components/UserTableRow'
import { useUsersPageViewModel } from './UsersPage.viewmodel'

export function UsersPage() {
  const vm = useUsersPageViewModel()

  return (
    <>
      <PageHeader
        title="Users"
        breadcrumbs={[{ label: 'Settings' }, { label: 'Users' }]}
        actions={
          <Button onClick={vm.openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <UserFilters
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        roleFilter={vm.roleFilter}
        onRoleFilterChange={vm.setRoleFilter}
        roles={vm.roles}
        statusFilter={vm.statusFilter}
        onStatusFilterChange={vm.setStatusFilter}
        showing={vm.users.length}
        total={vm.total}
      />

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Linked Employee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Login</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-secondary">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  vm.users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      roles={vm.roles}
                      currentUserId={vm.currentUserId}
                      onEdit={vm.openEditModal}
                      onDeactivate={vm.openDeactivateModal}
                      onReactivate={vm.onReactivate}
                      onResendInvite={vm.onResendInvite}
                      onResetPassword={vm.onResetPassword}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EmployeePagination
        page={vm.page}
        totalPages={vm.totalPages}
        start={vm.start}
        end={vm.end}
        total={vm.total}
        onPageChange={vm.onPageChange}
      />

      <UserFormModal
        isOpen={vm.isFormModalOpen}
        user={vm.selectedUser}
        roles={vm.roles}
        employees={vm.employees}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onSubmit={vm.onSubmit}
      />

      <DeactivateUserModal
        isOpen={vm.isDeactivateModalOpen}
        user={vm.selectedUser}
        isSubmitting={vm.isSubmitting}
        onClose={vm.closeModal}
        onConfirm={vm.onConfirmDeactivate}
      />
    </>
  )
}
