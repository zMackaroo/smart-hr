import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { BankAccount } from '../../../types/bank-account.types'
import { ACCOUNT_TYPE_LABELS } from '../../../types/bank-account.types'

interface SetPrimaryAccountModalProps {
  account: BankAccount | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SetPrimaryAccountModal({
  account,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: SetPrimaryAccountModalProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Set primary account?"
      message={
        account
          ? `Use ${account.bankName} ${ACCOUNT_TYPE_LABELS[account.accountType]} ${account.accountNumberMasked} as the primary payout account for ${account.employee.name}?`
          : ''
      }
      confirmLabel="Set Primary"
      isLoading={isSubmitting}
    />
  )
}
