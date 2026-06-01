import type { PlatformUserStatus } from '../../../types/user.types'
import type { Role } from '../../../types/permission.types'

interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  roles: Role[]
  statusFilter: PlatformUserStatus | ''
  onStatusFilterChange: (value: PlatformUserStatus | '') => void
  showing: number
  total: number
}

const selectClassName =
  'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

export function UserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roles,
  statusFilter,
  onStatusFilterChange,
  showing,
  total,
}: UserFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 rounded-lg border border-border/70 bg-surface p-4 shadow-card lg:flex-row lg:items-end">
      <div className="flex-1">
        <label htmlFor="user-search" className="mb-1 block text-sm font-medium text-primary">
          Search
        </label>
        <input
          id="user-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email..."
          className={selectClassName + ' w-full'}
        />
      </div>

      <div>
        <label htmlFor="user-role-filter" className="mb-1 block text-sm font-medium text-primary">
          Role
        </label>
        <select
          id="user-role-filter"
          value={roleFilter}
          onChange={(event) => onRoleFilterChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">All Roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="user-status-filter" className="mb-1 block text-sm font-medium text-primary">
          Status
        </label>
        <select
          id="user-status-filter"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as PlatformUserStatus | '')}
          className={selectClassName}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="invited">Invited</option>
        </select>
      </div>

      <p className="text-sm text-secondary lg:pb-2">
        Showing {showing} of {total}
      </p>
    </div>
  )
}
