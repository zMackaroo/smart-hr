import { Star } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import {
  ACCOUNT_TYPE_LABELS,
  type BankAccount,
} from '../../../types/bank-account.types'
import { BankAccountStatusBadge } from './BankAccountStatusBadge'

interface BankAccountCardProps {
  account: BankAccount
  onSetPrimary?: (account: BankAccount) => void
}

export function BankAccountCard({ account, onSetPrimary }: BankAccountCardProps) {
  const canSetPrimary =
    account.status === 'active' && !account.isPrimary && onSetPrimary

  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary">{account.bankName}</p>
          <p className="text-sm text-secondary">
            {ACCOUNT_TYPE_LABELS[account.accountType]} · {account.accountNumberMasked}
          </p>
          <p className="mt-1 text-xs text-secondary">
            {account.accountHolderName} · Routing {account.routingNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {account.isPrimary && (
            <Badge variant="info" className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Primary
            </Badge>
          )}
          <BankAccountStatusBadge status={account.status} />
        </div>
      </div>

      {canSetPrimary && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => onSetPrimary(account)}
        >
          Set as Primary
        </Button>
      )}
    </div>
  )
}
