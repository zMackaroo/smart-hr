import { MoreHorizontal } from 'lucide-react'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Dropdown } from '../../../components/ui/Dropdown'
import { formatRelativeTime } from '../../../utils/date.utils'
import type { PlatformUser } from '../../../types/user.types'
import type { Role } from '../../../types/permission.types'
import { getRoleDisplayName } from '../../../utils/role-assignment.utils'
import { UserStatusBadge } from './UserStatusBadge'

interface UserTableRowProps {
  user: PlatformUser
  roles: Role[]
  currentUserId?: string
  onEdit: (user: PlatformUser) => void
  onDeactivate: (user: PlatformUser) => void
  onReactivate: (id: string) => void
  onResendInvite: (id: string) => void
  onResetPassword: (id: string) => void
}

export function UserTableRow({
  user,
  roles,
  currentUserId,
  onEdit,
  onDeactivate,
  onReactivate,
  onResendInvite,
  onResetPassword,
}: UserTableRowProps) {
  const isSelf = user.id === currentUserId

  const actionItems = [
    { label: 'Edit', onClick: () => onEdit(user) },
    ...(user.status === 'active'
      ? [{ label: 'Deactivate', onClick: () => onDeactivate(user), destructive: true }]
      : []),
    ...(user.status === 'inactive'
      ? [{ label: 'Reactivate', onClick: () => onReactivate(user.id) }]
      : []),
    ...(user.status === 'invited'
      ? [{ label: 'Resend Invite', onClick: () => onResendInvite(user.id) }]
      : []),
    { label: 'Reset Password', onClick: () => onResetPassword(user.id) },
  ]

  return (
    <tr className="border-b border-border/50 last:border-b-0 hover:bg-surface-alt/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} seed={user.id} size="sm" />
          <div>
            <p className="font-medium text-primary">{user.name}</p>
            {isSelf && <p className="text-xs text-secondary">You</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-sm text-secondary">{user.email}</td>
      <td className="px-5 py-3 text-sm text-primary">{getRoleDisplayName(user, roles)}</td>
      <td className="px-5 py-3 text-sm text-secondary">
        {user.employee?.name ?? '—'}
      </td>
      <td className="px-5 py-3">
        <UserStatusBadge status={user.status} />
      </td>
      <td className="px-5 py-3 text-sm text-secondary">
        {user.status === 'invited'
          ? 'Pending invite'
          : user.lastLoginAt
            ? formatRelativeTime(user.lastLoginAt)
            : 'Never'}
      </td>
      <td className="px-5 py-3">
        <Dropdown
          trigger={
            <span className="inline-flex rounded p-1 hover:bg-surface-alt">
              <MoreHorizontal className="h-4 w-4 text-secondary" />
            </span>
          }
          items={actionItems}
        />
      </td>
    </tr>
  )
}
