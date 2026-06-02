import type { PlatformUserStatus } from '../../../types/user.types'
import type { Role } from '../../../types/permission.types'
import { Select, selectTriggerClassName } from '../../../components/ui/Select'

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
          className={selectTriggerClassName}
        />
      </div>

      <Select
        label="Role"
        value={roleFilter}
        onChange={onRoleFilterChange}
        options={[
          { value: '', label: 'All Roles' },
          ...roles.map((role) => ({ value: role.id, label: role.name })),
        ]}
        placeholder="All Roles"
        className="min-w-[10rem]"
      />

      <Select
        label="Status"
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value as PlatformUserStatus | '')}
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'invited', label: 'Invited' },
        ]}
        placeholder="All Statuses"
        searchable={false}
        className="min-w-[10rem]"
      />

      <p className="text-sm text-secondary lg:pb-2">
        Showing {showing} of {total}
      </p>
    </div>
  )
}
