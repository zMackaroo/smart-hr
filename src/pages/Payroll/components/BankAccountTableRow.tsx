import { Ban, MoreHorizontal, Pencil, Star } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Button } from '../../../components/ui/Button'
import { Dropdown } from '../../../components/ui/Dropdown'
import { Badge } from '../../../components/ui/Badge'
import {
  ACCOUNT_TYPE_LABELS,
  type BankAccount,
} from '../../../types/bank-account.types'
import { BankAccountStatusBadge } from './BankAccountStatusBadge'

interface BankAccountTableRowProps {
  account: BankAccount
  onEdit: (account: BankAccount) => void
  onSetPrimary: (account: BankAccount) => void
  onDeactivate: (account: BankAccount) => void
  onDelete: (account: BankAccount) => void
}

export function BankAccountTableRow({
  account,
  onEdit,
  onSetPrimary,
  onDeactivate,
  onDelete,
}: BankAccountTableRowProps) {
  const items = [
    { label: 'Edit', onClick: () => onEdit(account) },
    ...(account.status === 'active' && !account.isPrimary
      ? [{ label: 'Set Primary', onClick: () => onSetPrimary(account) }]
      : []),
    ...(account.status !== 'inactive'
      ? [{ label: 'Deactivate', onClick: () => onDeactivate(account), destructive: true }]
      : []),
    { label: 'Delete', onClick: () => onDelete(account), destructive: true },
  ]

  return (
    <tr className="border-b border-border/50 last:border-b-0 hover:bg-surface-alt/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={account.employee.name}
            avatarUrl={account.employee.avatarUrl}
            seed={account.employee.id}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-primary">{account.employee.name}</p>
            <p className="text-xs text-secondary">{account.employee.department}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-sm text-primary">{account.bankName}</td>
      <td className="px-5 py-3 text-sm text-secondary">{account.accountHolderName}</td>
      <td className="px-5 py-3 text-sm text-secondary">
        {ACCOUNT_TYPE_LABELS[account.accountType]}
      </td>
      <td className="px-5 py-3 font-mono text-sm text-primary">{account.accountNumberMasked}</td>
      <td className="px-5 py-3 font-mono text-sm text-secondary">{account.routingNumber}</td>
      <td className="px-5 py-3">
        {account.isPrimary ? (
          <Badge variant="info" className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Primary
          </Badge>
        ) : (
          <span className="text-sm text-muted">—</span>
        )}
      </td>
      <td className="px-5 py-3">
        <BankAccountStatusBadge status={account.status} />
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1">
          <PermissionGate module="bank_accounts" action="edit">
            <Button variant="ghost" size="sm" onClick={() => onEdit(account)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGate>
          {account.status === 'active' && !account.isPrimary && (
            <PermissionGate module="bank_accounts" action="edit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSetPrimary(account)}
                aria-label="Set primary"
              >
                <Star className="h-4 w-4 text-accent" />
              </Button>
            </PermissionGate>
          )}
          {account.status !== 'inactive' && (
            <PermissionGate module="bank_accounts" action="edit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(account)}
                aria-label="Deactivate"
              >
                <Ban className="h-4 w-4 text-warning" />
              </Button>
            </PermissionGate>
          )}
          <PermissionGate module="bank_accounts" action="delete">
            <Dropdown
              trigger={
                <span className="inline-flex rounded p-1 hover:bg-surface-alt">
                  <MoreHorizontal className="h-4 w-4 text-secondary" />
                </span>
              }
              items={items}
            />
          </PermissionGate>
        </div>
      </td>
    </tr>
  )
}
